// Property-based tests (fast-check) for the Correctness Properties in .kiro/specs/haunted-spec/design.md
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { analyze, exorcise, exorciseAll, calculateScore, toKiroRequirements } from '../src/core/index.mjs';

const VOCAB = ['THE', 'SYSTEM', 'SHALL', 'should', 'may', 'fast', 'easy', 'some', 'etc.', 'TBD', 'always', 'never',
  'instantly', 'is', 'sent', 'saved', 'by', 'and', 'email', 'save', 'the', 'user', 'page', 'within', '2', 's', 'WHEN',
  'clicks,', 'login', 'data', 'user-friendly', 'and/or', '100%', '-', '#', 'As', 'a', 'I', 'want', 'so', 'that', 'shall'];
const sentence = fc.array(fc.constantFrom(...VOCAB), { minLength: 0, maxLength: 14 }).map((w) => w.join(' '));
const doc = fc.array(sentence, { minLength: 0, maxLength: 8 }).map((l) => l.join('\n'));
const anyText = fc.oneof(doc, fc.string({ maxLength: 200 }), fc.fullUnicodeString({ maxLength: 120 }));
const RUNS = { numRuns: 500 };

test('Property: analyze is deterministic', () => {
  fc.assert(fc.property(anyText, (t) => { assert.deepEqual(analyze(t), analyze(t)); }), RUNS);
});

test('Property: score is an integer in [0, 100]', () => {
  fc.assert(fc.property(anyText, (t) => {
    const { score } = analyze(t);
    assert.ok(Number.isInteger(score) && score >= 0 && score <= 100);
  }), RUNS);
});

test('Property: findings point at real text (match === line.slice(start, end))', () => {
  fc.assert(fc.property(anyText, (t) => {
    const lines = t.split('\n');
    for (const f of analyze(t).findings) assert.equal(lines[f.lineIndex].replace(/\r$/, '').slice(f.start, f.end), f.match);
  }), RUNS);
});

test('Property: for fixed lines, adding a finding never lowers the score', () => {
  const finding = fc.record({ severity: fc.integer({ min: 1, max: 3 }), lineIndex: fc.integer({ min: 0, max: 5 }) });
  fc.assert(fc.property(fc.array(finding, { maxLength: 20 }), finding, (fs, extra) => {
    assert.ok(calculateScore([...fs, extra], 6) >= calculateScore(fs, 6));
  }), RUNS);
});

test('Property: exorciseAll is idempotent', () => {
  fc.assert(fc.property(anyText, (t) => {
    const once = exorciseAll(t);
    assert.equal(exorciseAll(once), once);
  }), RUNS);
});

test('Property: exorciseAll never raises the score and leaves no ghosts', () => {
  fc.assert(fc.property(doc, (t) => {
    const after = analyze(exorciseAll(t));
    assert.ok(after.score <= analyze(t).score);
    assert.equal(after.findings.length, 0);
  }), RUNS);
});

test('Property: exorcising one finding removes that finding', () => {
  fc.assert(fc.property(doc, (t) => {
    const { findings } = analyze(t);
    fc.pre(findings.length > 0);
    const f = findings[0];
    const next = exorcise(t, f);
    if (f.ghostId === 'two-headed-beast') {
      // one head is cut off: either the line is split in two, or a duplicate SHALL disappears
      const shalls = (s) => (s.split('\n')[f.lineIndex].match(/\bshall\b/gi) || []).length;
      assert.ok(next.split('\n').length > t.split('\n').length || shalls(next) < shalls(t));
      return;
    }
    const count = (fs) => fs.filter((g) => g.ghostId === f.ghostId && g.lineIndex === f.lineIndex).length;
    assert.ok(count(analyze(next).findings) < count(findings));
  }), RUNS);
});

test('Property: Kiro export always has the required skeleton', () => {
  fc.assert(fc.property(doc, (t) => {
    const md = toKiroRequirements(t);
    assert.ok(md.startsWith('# Requirements Document\n'));
    assert.ok(md.includes('## Requirements'));
    const reqs = (md.match(/^### Requirement \d+/gm) || []).length;
    assert.equal((md.match(/^#### Acceptance Criteria/gm) || []).length, reqs);
  }), RUNS);
});
