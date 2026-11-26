/**
 * Tokenizer: splits text into lines and classifies each one.
 * Pure and DOM-free.
 *
 * Line types:
 *  - 'blank'      empty / whitespace only
 *  - 'heading'    markdown heading (#...) or a bold label line such as "**Acceptance Criteria**"
 *  - 'code'       a code fence or a line inside a fenced block
 *  - 'meta'       front matter, tables, horizontal rules, link-only lines
 *  - 'userStory'  "As a <role>, I want <goal>[, so that <benefit>]"
 *  - 'requirement' everything else that reads like a sentence (3+ words)
 *  - 'note'       short fragments (fewer than 3 words) - not linted
 *  - 'prose'      sentences under an Introduction / Glossary / Overview / Background heading - not linted
 */

/** @typedef {'blank'|'heading'|'code'|'meta'|'userStory'|'requirement'|'note'|'prose'} LineType */

const PROSE_SECTION = /^#+\s*(introduction|glossary|overview|background|context|notes?|terms|definitions|out of scope|non-goals)\b/i;
/** @typedef {{ text: string, index: number, offset: number, type: LineType, bodyStart: number, shapeExempt?: boolean }} Line */

// A bold label that introduces a requirement ("**Requirement:** ...") vs. one that introduces metadata
// ("**Stakeholder:** ...", "- **Fault Injection**: ...").
const LABEL = /^\*\*([^*]+?):?\*\*:?\s+\S/;
const REQ_LABEL = /requirement|criteri|rule|story|shall/i;

/**
 * Is this requirement line exempt from the EARS-shape rule (Wandering Soul)?
 * Measured on 10 public requirement docs (README "Measured on real specs"): most Wandering Soul
 * false positives were hard-wrapped prose, metadata labels and multi-sentence descriptions.
 * Word-level ghosts still run on these lines; only the "no SHALL" rule is skipped.
 */
function isShapeExempt(raw, i, isBullet) {
  const body = raw[i].slice(bodyStart(raw[i])).trim();
  const label = LABEL.exec(body);
  if (label && !REQ_LABEL.test(label[1])) return true;            // metadata label line
  if (/[.!?]\s+["'(*]?[A-Z]/.test(body.replace(/\b(?:e\.g|i\.e|etc|vs|approx)\./gi, ''))) return true; // 2+ sentences = prose
  if (isBullet) return false;
  if (/^[a-z`,;:)]/.test(body)) return true;                   // continuation of a wrapped line
  const textLine = (j) => j >= 0 && j < raw.length && raw[j].trim() !== '' && !BULLET.test(raw[j])
    && !/^\s*(#|```|~~~|\||>|<!--|---)/.test(raw[j]);
  return textLine(i - 1) || textLine(i + 1);                        // part of a multi-line paragraph
}

const BULLET = /^(\s*(?:[-*+]|\d+(?:\.\d+)*[.)])\s+)/;
const STORY = /^(?:\*\*user story:?\*\*:?\s*)?as an?\s+.+?,?\s+i (?:want|need|would like)\b/i;

/**
 * Index where the sentence body starts (after list bullets / numbering).
 * @param {string} line
 * @returns {number}
 */
export function bodyStart(line) {
  const m = BULLET.exec(line);
  return m ? m[1].length : (line.length - line.trimStart().length);
}

/**
 * Classify one line out of context (fences are handled by tokenize).
 * @param {string} line
 * @returns {LineType}
 */
export function classifyLine(line) {
  const t = line.trim();
  if (t === '') return 'blank';
  if (t.startsWith('```') || t.startsWith('~~~')) return 'code';
  if (t.startsWith('#')) return 'heading';
  if (/^(---+|\*\*\*+|___+)$/.test(t)) return 'meta';
  if (t.startsWith('|') || t.startsWith('>') || /^<!--/.test(t)) return 'meta';
  const body = line.slice(bodyStart(line)).trim();
  if (/^\*\*[^*]+\*\*:?$/.test(body)) return 'heading';
  if (STORY.test(body)) return 'userStory';
  const words = body.replace(/[*_`]/g, '').split(/\s+/).filter(Boolean);
  if (words.length < 3) return 'note';
  return 'requirement';
}

/**
 * Split text into classified lines.
 * @param {string} text
 * @returns {Line[]}
 */
export function tokenize(text) {
  if (typeof text !== 'string' || text === '') return [];
  const raw = text.split('\n');
  const clean = raw.map((r) => r.replace(/\r$/, ''));
  const out = [];
  let offset = 0;
  let inFence = false;
  let inFrontMatter = false;
  let inProse = false;
  let proseLevel = 0;
  for (let i = 0; i < raw.length; i++) {
    const lineText = raw[i].replace(/\r$/, '');
    const trimmed = lineText.trim();
    let type;
    if (i === 0 && trimmed === '---') {
      inFrontMatter = true;
      type = 'meta';
    } else if (inFrontMatter) {
      type = 'meta';
      if (trimmed === '---') inFrontMatter = false;
    } else if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inFence = !inFence;
      type = 'code';
    } else if (inFence) {
      type = 'code';
    } else {
      type = classifyLine(lineText);
      if (type === 'heading' && trimmed.startsWith('#')) {
        const level = /^#+/.exec(trimmed)[0].length;
        if (!inProse || level <= proseLevel) {
          inProse = PROSE_SECTION.test(trimmed);
          proseLevel = level;
        }
      }
      else if (inProse && type === 'requirement') type = 'prose';
    }
    const entry = { text: lineText, index: i, offset, type, bodyStart: bodyStart(lineText) };
    if (type === 'requirement' && isShapeExempt(clean, i, BULLET.test(lineText))) entry.shapeExempt = true;
    out.push(entry);
    offset += raw[i].length + 1;
  }
  return out;
}
