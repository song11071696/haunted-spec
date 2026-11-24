/**
 * analyze(text) -> { lines, findings, score, band, stats }
 * Pure and deterministic.
 */
import { tokenize } from './tokenize.mjs';
import { detectGhosts, GHOSTS } from './ghosts.mjs';
import { calculateScore, getBand } from './score.mjs';

const STORY_GHOSTS = new Set(['specter-of-vagueness', 'poltergeist-of-ambiguity', 'banshee-of-absolutes']);

export function analyze(text) {
  const lines = tokenize(text ?? '');
  const findings = [];
  let requirementLines = 0;
  let userStories = 0;
  for (const line of lines) {
    if (line.type === 'userStory') {
      // Stories are judged on their words only: no SHALL/EARS shape is expected of them.
      userStories++;
      requirementLines++;
      findings.push(...detectGhosts(line).filter((f) => STORY_GHOSTS.has(f.ghostId)));
      continue;
    }
    if (line.type !== 'requirement') continue;
    requirementLines++;
    findings.push(...detectGhosts(line));
  }
  const score = calculateScore(findings, requirementLines);
  const byGhost = Object.fromEntries(GHOSTS.map((g) => [g.id, 0]));
  for (const f of findings) byGhost[f.ghostId]++;
  const hauntedLines = new Set(findings.map((f) => f.lineIndex)).size;
  return {
    lines,
    findings,
    score,
    band: getBand(score),
    stats: { requirementLines, userStories, hauntedLines, byGhost },
  };
}
