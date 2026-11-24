/**
 * Exorcism: deterministic rewrites that banish ghosts.
 */
import { analyze } from './analyze.mjs';
import { GHOST_BY_ID } from './ghosts.mjs';

/**
 * Apply the fix for one finding. Returns the new full text.
 * If the finding no longer matches the text (stale), the text is returned unchanged.
 */
export function exorcise(text, finding) {
  const lines = text.split('\n');
  const line = lines[finding.lineIndex];
  if (line === undefined) return text;
  if (line.slice(finding.start, finding.end) !== finding.match) return text;
  const ghost = GHOST_BY_ID[finding.ghostId];
  if (!ghost) return text;
  lines[finding.lineIndex] = ghost.fix(line, finding);
  return lines.join('\n');
}

const MAX_PASSES = 64;

/**
 * Exorcise every ghost. Applies one finding per line per pass (rightmost first, so offsets stay valid)
 * and repeats until the text stops changing. Idempotent: exorciseAll(exorciseAll(t)) === exorciseAll(t).
 */
export function exorciseAll(text) {
  let current = text ?? '';
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const { findings } = analyze(current);
    if (findings.length === 0) return current;
    // Wandering souls are fixed last: other fixes may give the line its SHALL.
    const ranked = [...findings].sort((a, b) =>
      (a.ghostId === 'wandering-soul') - (b.ghostId === 'wandering-soul') || b.start - a.start);
    const seen = new Set();
    const picks = [];
    for (const f of ranked) {
      if (seen.has(f.lineIndex)) continue;
      seen.add(f.lineIndex);
      picks.push(f);
    }
    // apply from the bottom line upwards (two-headed fixes insert lines)
    picks.sort((a, b) => b.lineIndex - a.lineIndex);
    let next = current;
    for (const f of picks) next = exorcise(next, f);
    if (next === current) return current;
    current = next;
  }
  return current;
}
