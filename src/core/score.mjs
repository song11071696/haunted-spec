/**
 * Haunt score: 0 (purified) .. 100 (fully cursed).
 *
 * Each requirement line contributes min(sum of severities on that line, LINE_CAP).
 * score = round(100 * total / (LINE_CAP * requirementLineCount))
 *
 * Properties (see design.md, Correctness Properties):
 *  - bounded: 0 <= score <= 100
 *  - monotonic: for a fixed set of lines, adding a finding never lowers the score
 *    and removing one never raises it.
 */
export const LINE_CAP = 6;

export const BANDS = [
  { name: 'Purified', max: 10, blurb: 'The fog has lifted. Every line is testable.' },
  { name: 'Restless', max: 35, blurb: 'A few spirits stir. Exorcise them before they spread.' },
  { name: 'Haunted', max: 65, blurb: 'This spec is haunted. An agent would guess at half of it.' },
  { name: 'Cursed', max: 100, blurb: 'Fully cursed. Nobody can test what this asks for.' },
];

/**
 * @param {Array<{severity:number,lineIndex?:number}>} findings
 * @param {number} requirementLineCount
 * @returns {number}
 */
export function calculateScore(findings, requirementLineCount) {
  if (!requirementLineCount || requirementLineCount <= 0 || findings.length === 0) return 0;
  const perLine = new Map();
  findings.forEach((f, i) => {
    const key = f.lineIndex ?? `solo${i}`;
    perLine.set(key, (perLine.get(key) || 0) + f.severity);
  });
  let total = 0;
  for (const v of perLine.values()) total += Math.min(v, LINE_CAP);
  const lines = Math.max(requirementLineCount, perLine.size);
  return Math.min(100, Math.max(0, Math.round((100 * total) / (LINE_CAP * lines))));
}

/**
 * @param {number} score
 * @returns {'Purified'|'Restless'|'Haunted'|'Cursed'}
 */
export function getBand(score) {
  return /** @type any */ ((BANDS.find((b) => score <= b.max) || BANDS[BANDS.length - 1]).name);
}

export function bandInfo(score) {
  return BANDS.find((b) => score <= b.max) || BANDS[BANDS.length - 1];
}
