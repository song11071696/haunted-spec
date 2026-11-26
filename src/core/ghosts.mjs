/**
 * The Ghost Bestiary: every lint rule Haunted Spec knows.
 * Pure data + pure functions. No DOM.
 *
 * Each ghost:
 *   id, name, color, severity (1-3), silhouette (UI art key), summary, why,
 *   detect(maskedLine, line) -> Array<{start, end, match}>
 *   fix(lineText, hit) -> new line text (deterministic, safe rewrite)
 */

/** @typedef {{ start: number, end: number, match: string }} Hit */

// Text inside placeholders ‹...›, inline code `...` and quotations ("...", 'word') is never linted:
// exorcised lines stay exorcised, and a spec may *mention* a ghost word without being haunted by it.
const PLACEHOLDER = /‹[^›]*›|`[^`]*`|"[^"\n]*"|“[^”\n]*”|(?<![\w])'[^'\n]+'(?![\w])/g;

/**
 * Replace placeholder / inline-code regions with spaces (same length) so offsets stay valid.
 * @param {string} s
 */
export function mask(s) {
  return s.replace(PLACEHOLDER, (m) => ' '.repeat(m.length));
}

function words(list) {
  return list
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&').replace(/ /g, '\\s+'))
    .join('|');
}

function scan(re, s) {
  const hits = [];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m[0].length === 0) { re.lastIndex++; continue; }
    hits.push({ start: m.index, end: m.index + m[0].length, match: m[0] });
  }
  return hits;
}

const B = '(?<![\\w-])'; // word start (hyphen counts as part of a word: user-friendly)
const E = '(?![\\w-])';

const VAGUE = ['fast', 'faster', 'quick', 'quickly', 'easy', 'easily', 'simple', 'simply', 'user-friendly',
  'user friendly', 'intuitive', 'intuitively', 'robust', 'scalable', 'seamless', 'seamlessly', 'efficient',
  'efficiently', 'flexible', 'modern', 'reliable', 'reliably', 'performant', 'smooth', 'smoothly', 'lightweight',
  'state-of-the-art', 'best-in-class', 'blazing', 'snappy', 'nice', 'good-looking', 'beautiful', 'clean', 'accurate',
  'accurately', 'real-time', 'secure', 'securely', 'high-quality', 'high quality'];

const VAGUE_HINTS = {
  fast: 'within 2 s at p95', faster: 'within 2 s at p95', quick: 'within 2 s at p95', quickly: 'within 2 s at p95',
  blazing: 'within 200 ms at p95', snappy: 'within 200 ms at p95', performant: 'within 200 ms at p95',
  smooth: 'at 60 fps', smoothly: 'at 60 fps',
  easy: 'in at most 3 steps', easily: 'in at most 3 steps', simple: 'in at most 3 steps', simply: 'in at most 3 steps',
  'user-friendly': 'completable by a first-time user in under 1 min', 'user friendly': 'completable by a first-time user in under 1 min',
  intuitive: 'completable by a first-time user in under 1 min', intuitively: 'completable by a first-time user in under 1 min',
  robust: 'with 99.9% monthly success rate', reliable: 'with 99.9% monthly uptime', reliably: 'with 99.9% monthly uptime',
  scalable: 'for 10,000 concurrent users', efficient: 'using under 50 MB of memory', efficiently: 'using under 50 MB of memory',
  lightweight: 'under 100 KB gzipped', accurate: 'within ±1% of the source value', accurately: 'within ±1% of the source value',
  'real-time': 'updated within 5 s', secure: 'meeting OWASP ASVS level 1', securely: 'meeting OWASP ASVS level 1',
};

const AMBIGUOUS = ['some', 'many', 'several', 'most', 'few', 'various', 'numerous', 'appropriate', 'appropriately',
  'adequate', 'adequately', 'reasonable', 'reasonably', 'as needed', 'as appropriate', 'if possible', 'where possible',
  'as required', 'and so on', 'and more', 'or similar', 'and/or', 'tbd', 'tbc', 'etc'];
const REMOVABLE = /^(etc\.?|and\s+so\s+on|and\s+more|or\s+similar|if\s+possible|where\s+possible)$/i;

const WEAK = ['should', 'may', 'might', 'could', 'would', 'ideally', 'preferably', 'try to', 'attempt to', 'hopefully'];
const WEAK_TO_SHALL = /^(should|may|might|could|would)$/i;

const ABSOLUTES = ['always', 'never', 'every time', 'at all times', '100%', '100 %', 'instantly', 'instantaneously',
  'immediately', 'zero downtime', 'forever', 'guaranteed', 'without any errors', 'without errors', 'without fail',
  'under all conditions', 'any time', 'all devices', 'all browsers', 'all platforms', 'any device', 'any browser'];
const ABSOLUTE_HINTS = {
  always: 'in at least 99.9% of attempts', 'every time': 'in at least 99.9% of attempts',
  'at all times': 'with 99.9% monthly uptime', never: 'in fewer than 0.1% of cases',
  instantly: 'within 500 ms', instantaneously: 'within 500 ms', immediately: 'within 500 ms',
  'zero downtime': 'with at most 5 min downtime per month', '100%': '99.9%', '100 %': '99.9%',
  'all devices': 'on the 2 latest versions of Chrome, Firefox and Safari', 'all browsers': 'on the 2 latest versions of Chrome, Firefox and Safari',
  'any device': 'on the 2 latest versions of Chrome, Firefox and Safari', 'any browser': 'on the 2 latest versions of Chrome, Firefox and Safari',
  'all platforms': 'on Windows 11, macOS 14 and Ubuntu 24.04',
};

const PARTICIPLES = '(?:\\w+ed|sent|shown|made|done|given|taken|seen|written|built|kept|known|run|found|held|told|paid|' +
  'put|read|sold|lost|left|set|chosen|drawn|thrown|hidden|bound|brought|caught|bought|sought|thought|shut|cut|split|spent|' +
  'sent|won|begun|frozen|stolen|forgotten|withdrawn|overridden|rewritten|undone)';
const PASSIVE = new RegExp(`${B}(?:is|are|was|were|be|been|being|gets|get|got)\\s+(?:\\w+ly\\s+)?${PARTICIPLES}${E}(?!\\s+by\\b)`, 'gi');
const PASSIVE_SKIP = /^(?:is|are|was|were|be|been|being|gets|get|got)\s+(?:\w+ly\s+)?(need|feed|speed|seed|bleed|breed|exceed|proceed|succeed|indeed|bed|red|shed|wed|used|based|related|located|interested|required|supposed|able|ready)$/i;

const ACTIONS = 'send|save|display|show|create|delete|update|notify|email|log|store|export|import|validate|redirect|return|' +
  'generate|calculate|load|play|render|reject|accept|lock|unlock|refresh|sync|upload|download|print|record|remove|add|' +
  'open|close|start|stop|allow|prevent|block|charge|refund|track|alert|archive|publish|schedule|cancel|retry|encrypt|' +
  'compress|highlight|announce|focus|persist|restore|disable|enable|hide|reset|clear|sort|filter|copy|share|invite';
const TWO_HEADS = new RegExp(`\\b(?:and|or)\\s+(?:then\\s+)?(?:also\\s+)?(?:shall\\s+)?(?:${ACTIONS})\\b`, 'gi');

function hasShall(s) { return /\b(shall|must)\b/i.test(s); }

function lcFirst(s) {
  if (/^[A-Z](?:[a-z]|\s)/.test(s) && !/^(I|API|URL|UI|THE)\b/.test(s)) return s[0].toLowerCase() + s.slice(1);
  return s;
}

function splice(s, start, end, insert) { return s.slice(0, start) + insert + s.slice(end); }

function tidy(s) {
  return s.replace(/[ \t]{2,}/g, ' ').replace(/\s+([,.;:])/g, '$1').replace(/,\s*,/g, ',').replace(/,\./g, '.').replace(/\s+$/, '');
}

/** @type {Array<any>} */
export const GHOSTS = [
  {
    id: 'specter-of-vagueness',
    name: 'Specter of Vagueness',
    color: '#b48cff',
    severity: 2,
    silhouette: 'wisp',
    summary: 'Unmeasurable quality words',
    why: 'Words like "fast" or "user-friendly" cannot be tested. Two people (or an AI agent) will build two different things.',
    detect: (m) => scan(new RegExp(`${B}(?:${words(VAGUE)})${E}`, 'gi'), m),
    fix: (line, h) => splice(line, h.start, h.end, `‹measurable: ${VAGUE_HINTS[h.match.toLowerCase().replace(/\s+/g, ' ')] || 'a number + unit'}›`),
  },
  {
    id: 'poltergeist-of-ambiguity',
    name: 'Poltergeist of Ambiguity',
    color: '#ff9f43',
    severity: 2,
    silhouette: 'poltergeist',
    summary: 'Vague quantifiers and escape hatches',
    why: '"Some users", "etc." and "TBD" leave the real scope undecided, so nobody can say when the work is done.',
    detect: (m) => scan(new RegExp(`${B}(?:${words(AMBIGUOUS)})${E}`, 'gi'), m)
      .map((h) => (/^etc$/i.test(h.match) && m[h.end] === '.' ? { ...h, end: h.end + 1, match: h.match + '.' } : h)),
    fix: (line, h) => {
      if (REMOVABLE.test(h.match.trim())) {
        let start = h.start;
        while (start > 0 && /[\s,]/.test(line[start - 1])) start--;
        return tidy(splice(line, start, h.end, ''));
      }
      if (/and\/or/i.test(h.match)) return splice(line, h.start, h.end, '‹choose: and | or›');
      return splice(line, h.start, h.end, `‹specify: exact ${/^(some|many|several|most|few|various|numerous)$/i.test(h.match) ? 'count or set' : 'rule'}›`);
    },
  },
  {
    id: 'wraith-of-weak-will',
    name: 'Wraith of Weak Will',
    color: '#4dc9ff',
    severity: 2,
    silhouette: 'wraith',
    summary: 'Weak modal verbs',
    why: '"Should" and "may" make a requirement optional. EARS uses SHALL so every statement is a binding, testable promise.',
    detect: (m) => scan(new RegExp(`${B}(?:${words(WEAK)})${E}`, 'gi'), m),
    fix: (line, h) => {
      if (WEAK_TO_SHALL.test(h.match)) {
        // "should be able to X" -> "SHALL X" is left to the author; we only harden the modal.
        return splice(line, h.start, h.end, hasShall(line) ? '' : 'SHALL').replace(/[ \t]{2,}/g, ' ');
      }
      return tidy(splice(line, h.start, h.end, ''));
    },
  },
  {
    id: 'faceless-ghoul',
    name: 'Faceless Ghoul',
    color: '#c8d0d8',
    severity: 1,
    silhouette: 'ghoul',
    summary: 'Passive voice with no actor',
    why: '"An email is sent" hides WHO sends it. Naming the actor tells you which component to build and test.',
    detect: (m, line) => {
      // Passive voice inside an EARS trigger clause ("WHEN the file is saved, THE SYSTEM SHALL ...") describes
      // an event, not a missing actor, so it is allowed before the SHALL.
      const body = m.slice(line ? line.bodyStart : 0);
      const shallAt = m.search(/\bshall\b/i);
      const triggered = /^\s*(?:\d+\.\s*)?(when|while|if|where|after|before|once|during)\b/i.test(body);
      return scan(new RegExp(PASSIVE.source, 'gi'), m)
        .filter((h) => !PASSIVE_SKIP.test(h.match))
        .filter((h) => !(triggered && shallAt > h.start));
    },
    fix: (line, h) => splice(line, h.end, h.end, ' by ‹actor: e.g. THE SYSTEM›'),
  },
  {
    id: 'banshee-of-absolutes',
    name: 'Banshee of Absolutes',
    color: '#ff4d6d',
    severity: 2,
    silhouette: 'banshee',
    summary: 'Untestable absolutes',
    why: '"Always", "never" and "instantly" can never be proven by a test. A bounded target can.',
    detect: (m) => scan(new RegExp(`${B}(?:${words(ABSOLUTES)})(?![\\w-])`, 'gi'), m),
    fix: (line, h) => splice(line, h.start, h.end, `‹bounded: ${ABSOLUTE_HINTS[h.match.toLowerCase().replace(/\s+/g, ' ')] || 'a measurable limit'}›`),
  },
  {
    id: 'wandering-soul',
    name: 'Wandering Soul',
    color: '#3ee6b0',
    severity: 2,
    silhouette: 'soul',
    summary: 'Requirement with no EARS shape',
    why: 'A sentence without SHALL is a wish, not a requirement. EARS ("WHEN <trigger>, THE SYSTEM SHALL <response>") makes it testable.',
    detect: (m, line) => {
      if (hasShall(m)) return [];
      if (line && line.shapeExempt) return []; // wrapped prose, metadata label or multi-sentence description
      if (new RegExp(`${B}(?:should|may|might|could|would)${E}`, 'i').test(m)) return []; // the Wraith owns this line
      const start = line ? line.bodyStart : 0;
      const end = m.replace(/\s+$/, '').length;
      if (end <= start) return [];
      return [{ start, end, match: m.slice(start, end) }];
    },
    fix: (line, h) => {
      const prefix = line.slice(0, h.start);
      const body = line.slice(h.start).trim().replace(/\.$/, '');
      const trig = /^(when|while|if|where|after|before|once)\b([^,]+),\s*(.+)$/i.exec(body);
      if (trig) {
        return `${prefix}${trig[1].toUpperCase()}${trig[2]}, THE SYSTEM SHALL ${lcFirst(trig[3])}.`;
      }
      return `${prefix}THE SYSTEM SHALL ensure that ${lcFirst(body)}.`;
    },
  },
  {
    id: 'two-headed-beast',
    name: 'Two-Headed Beast',
    color: '#ffd166',
    severity: 2,
    silhouette: 'beast',
    summary: 'Two requirements fused into one',
    why: 'A line that SHALLs two things passes or fails as one, so a half-done feature looks finished. One requirement, one behaviour.',
    detect: (m) => {
      const shall = /\bshall\b/i.exec(m);
      if (!shall) return [];
      const after = m.slice(shall.index + 5);
      const shalls = scan(/\bshall\b/gi, after);
      if (shalls.length > 0) {
        const s = shalls[0];
        return [{ start: shall.index + 5 + s.start, end: shall.index + 5 + s.end, match: s.match }];
      }
      const heads = scan(new RegExp(TWO_HEADS.source, 'gi'), after);
      return heads.length ? [{ start: shall.index + 5 + heads[0].start, end: shall.index + 5 + heads[0].end, match: heads[0].match }] : [];
    },
    fix: (line, h) => {
      const shall = /\bshall\b/i.exec(line);
      const between = line.slice(shall.index + 5, h.start);
      const rest = line.slice(h.end);
      if (/^shall$/i.test(h.match) && (/^[\s,;]*(and|or)?[\s,;]*$/i.test(between) || !/\w/.test(rest))) {
        // a stuttering duplicate SHALL: drop the second head
        const collapsed = line.replace(/\bshall\b(?:[\s,;]+(?:(?:and|or)[\s,;]+)?shall\b)+/gi, (m) => m.slice(0, 5));
        return tidy(collapsed === line ? splice(line, h.start, h.end, '') : collapsed);
      }
      const head = line.slice(0, shall.index + 5);
      const firstPart = line.slice(0, h.start).replace(/[\s,;]+(and|or)?\s*$/i, '').replace(/\.$/, '');
      let second = line.slice(h.start).replace(/^\s*(and|or)\s+(then\s+)?(also\s+)?/i, '').replace(/^shall\s+/i, '');
      const subject = head.replace(/^(\s*(?:[-*+]|\d+(?:\.\d+)*[.)])\s+)/, '');
      const bullet = (/^(\s*(?:[-*+]|\d+(?:\.\d+)*[.)])\s+)/.exec(line) || ['', ''])[1];
      second = second.replace(/^\s+/, '');
      return `${firstPart}.\n${bullet}${subject} ${second}`.replace(/\.\.$/, '.');
    },
  },
];

export const GHOST_BY_ID = Object.fromEntries(GHOSTS.map((g) => [g.id, g]));

/**
 * Detect every ghost haunting one requirement line.
 * @param {{ text: string, index: number, bodyStart?: number }} line
 * @returns {Array<{ghostId:string,lineIndex:number,start:number,end:number,match:string,severity:number,message:string,suggestion:string}>}
 */
export function detectGhosts(line) {
  const masked = mask(line.text);
  const lineInfo = { bodyStart: line.bodyStart ?? 0, shapeExempt: !!line.shapeExempt };
  const findings = [];
  for (const ghost of GHOSTS) {
    for (const h of ghost.detect(masked, lineInfo)) {
      const hit = { start: h.start, end: h.end, match: line.text.slice(h.start, h.end) };
      findings.push({
        id: `${ghost.id}@${line.index}:${hit.start}`,
        ghostId: ghost.id,
        lineIndex: line.index,
        start: hit.start,
        end: hit.end,
        match: hit.match,
        severity: ghost.severity,
        message: `${ghost.name}: ${ghost.summary.toLowerCase()} - "${hit.match.trim()}"`,
        suggestion: ghost.fix(line.text, hit),
      });
    }
  }
  return findings.sort((a, b) => a.start - b.start || a.ghostId.localeCompare(b.ghostId));
}
