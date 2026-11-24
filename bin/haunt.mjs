#!/usr/bin/env node
/**
 * haunt - lint a requirements/spec markdown file from the terminal (same core as the web app).
 *
 *   node bin/haunt.mjs <file.md> [--max N] [--json] [--fix] [--kiro]
 *
 *   --max N   exit 1 when the haunt score is above N (default 100)
 *   --json    print the full report as JSON
 *   --fix     print the exorcised text instead of findings
 *   --kiro    print a Kiro-format requirements.md
 * Exit codes: 0 ok, 1 score above --max, 2 usage / file error.
 */
import { readFileSync } from 'node:fs';
import { analyze, exorciseAll, toKiroRequirements, GHOST_BY_ID } from '../src/core/index.mjs';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const maxIdx = args.indexOf('--max');
const max = maxIdx >= 0 ? Number(args[maxIdx + 1]) : 100;
const file = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--max');

if (flag('--help') || flag('-h') || !file || Number.isNaN(max)) {
  console.log('Usage: haunt <file.md> [--max N] [--json] [--fix] [--kiro]');
  process.exit(file || flag('--help') || flag('-h') ? 0 : 2);
}

let text;
try {
  text = readFileSync(file, 'utf8');
} catch (e) {
  console.error(`haunt: cannot read ${file}: ${e.message}`);
  process.exit(2);
}

const report = analyze(text);
if (flag('--json')) {
  console.log(JSON.stringify({ file, score: report.score, band: report.band, stats: report.stats, findings: report.findings }, null, 2));
} else if (flag('--fix')) {
  process.stdout.write(exorciseAll(text));
} else if (flag('--kiro')) {
  process.stdout.write(toKiroRequirements(text));
} else {
  for (const f of report.findings) {
    const g = GHOST_BY_ID[f.ghostId];
    console.log(`L${f.lineIndex + 1}:${f.start + 1}  ${g.name.padEnd(24)} "${f.match.trim().slice(0, 60)}"`);
  }
  const s = report.stats;
  console.log(`\n${report.findings.length} ghost(s) on ${s.hauntedLines}/${s.requirementLines} requirement line(s)`);
  console.log(`Haunt score: ${report.score}/100 (${report.band})${maxIdx >= 0 ? `  [max ${max}]` : ''}`);
}
process.exit(report.score > max ? 1 : 0);
