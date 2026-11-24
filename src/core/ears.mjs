/**
 * EARS transmutation and Kiro requirements.md export.
 * EARS = Easy Approach to Requirements Syntax:
 *   ubiquitous:  THE <system> SHALL <response>
 *   event:       WHEN <trigger>, THE <system> SHALL <response>
 *   state:       WHILE <state>, THE <system> SHALL <response>
 *   unwanted:    IF <condition>, THEN THE <system> SHALL <response>
 *   optional:    WHERE <feature>, THE <system> SHALL <response>
 */
import { tokenize, bodyStart } from './tokenize.mjs';
import { exorciseAll } from './exorcise.mjs';
import { analyze } from './analyze.mjs';

const STORY = /^(?:\*\*user story:?\*\*:?\s*)?as an?\s+(.+?),?\s+i (?:want|need|would like)(?: to)?\s+(.+?)(?:,?\s+so(?: that)?\s+(.+?))?\.?$/i;

/**
 * Parse a user story line.
 * @param {string} line
 * @returns {{role:string, goal:string, benefit:string|null}|null}
 */
export function parseStory(line) {
  const body = line.slice(bodyStart(line)).trim();
  const m = STORY.exec(body);
  if (!m) return null;
  return { role: m[1].trim(), goal: m[2].trim().replace(/[.,]$/, ''), benefit: m[3] ? m[3].trim() : null };
}

/**
 * Convert a single line into EARS form.
 * User stories become an event-driven acceptance criterion; other lines are exorcised into EARS.
 * @param {string} line
 * @returns {string}
 */
export function toEars(line) {
  const story = parseStory(line);
  if (story) {
    const goal = story.goal.replace(/\bmy\b/gi, 'their').replace(/\bI\b/g, 'they').replace(/\bme\b/gi, 'them');
    return `WHEN the ${story.role} chooses to ${goal}, THE SYSTEM SHALL let the ${story.role} ${goal}.`;
  }
  const t = line.trim();
  if (!t) return line;
  const fixed = exorciseAll(t);
  if (/\b(shall|must)\b/i.test(fixed)) return fixed.split('\n').map((s) => s.trim()).join('\n');
  return `THE SYSTEM SHALL ensure that ${fixed.replace(/\.$/, '')}.`;
}

function titleFrom(s) {
  const t = s.replace(/‹[^›]*›/g, '').replace(/\s{2,}/g, ' ').replace(/^#+\s*/, '').replace(/^requirement\s*\d*:?\s*/i, '').trim();
  return t ? t[0].toUpperCase() + t.slice(1) : '';
}

/**
 * Build a Kiro-style requirements.md from free text.
 * Each user story opens a requirement; following requirement lines become its acceptance criteria.
 * @param {string} text
 * @param {{ title?: string }} [opts]
 * @returns {string}
 */
export function toKiroRequirements(text, opts = {}) {
  const before = analyze(text);
  const lines = tokenize(text);
  /** @type {Array<{title:string, story:string, criteria:string[]}>} */
  const reqs = [];
  let pendingTitle = '';
  let current = null;
  const open = (title, story) => {
    current = { title, story, criteria: [] };
    reqs.push(current);
  };
  for (const line of lines) {
    if (line.type === 'heading') {
      const t = titleFrom(line.text.replace(/\*\*/g, ''));
      if (t && !/^(acceptance criteria|requirements?( document)?|introduction|glossary|user stor(y|ies):?)$/i.test(t)) pendingTitle = t;
      continue;
    }
    if (line.type === 'userStory') {
      const s = parseStory(line.text);
      const storyText = s
        ? `As a ${s.role}, I want to ${s.goal}, so that ${s.benefit || '‹benefit›'}`
        : line.text.slice(line.bodyStart).trim();
      open(pendingTitle || (s ? titleFrom(s.goal) : `Requirement ${reqs.length + 1}`), storyText);
      pendingTitle = '';
      if (s) current.criteria.push(toEars(line.text));
      continue;
    }
    if (line.type !== 'requirement') continue;
    if (!current || (pendingTitle && current.title !== pendingTitle)) {
      open(pendingTitle || 'General behaviour', 'As a user, I want ‹goal›, so that ‹benefit›');
      pendingTitle = '';
    }
    const body = line.text.slice(line.bodyStart).trim();
    for (const c of toEars(body).split('\n')) current.criteria.push(c.trim());
  }
  const out = [];
  out.push('# Requirements Document', '');
  out.push('## Introduction', '');
  out.push(`${opts.title ? opts.title + ': r' : 'R'}equirements transmuted into EARS notation by Haunted Spec. ` +
    `Haunt score before exorcism: ${before.score} (${before.band}). Placeholders in ‹angle quotes› mark decisions the team still owes.`, '');
  out.push('## Requirements', '');
  reqs.forEach((r, i) => {
    out.push(`### Requirement ${i + 1}: ${r.title}`, '');
    out.push(`**User Story:** ${r.story}`, '');
    out.push('#### Acceptance Criteria', '');
    r.criteria.forEach((c, j) => out.push(`${j + 1}. ${c}`));
    out.push('');
  });
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}
