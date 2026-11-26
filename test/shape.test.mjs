// Wandering Soul (EARS shape) must not fire on prose, metadata labels or multi-sentence descriptions.
// Added after measuring 10 public requirement docs (see docs/measured.md).
import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze } from '../src/core/index.mjs';

const souls = (t) => analyze(t).findings.filter((f) => f.ghostId === 'wandering-soul').length;

test('hard-wrapped prose paragraphs are not requirements', () => {
  assert.equal(souls('A presentation display connected to the same IPv4 or IPv6 subnet and reachable\nby the controlling user agent over the local network.'), 0);
});
test('metadata label lines are skipped, requirement labels are not', () => {
  assert.equal(souls('**Stakeholder:** Students, Lecturers and Staff'), 0);
  assert.equal(souls('- **Fault Injection**: Testing failure scenarios at specific stages'), 0);
  assert.equal(souls('**Requirement:** Users log in with email.'), 1);
});
test('multi-sentence descriptions are prose', () => {
  assert.equal(souls('This document defines the requirements for the system. All requirements are traceable.'), 0);
});
test('standalone requirement lines and bullets still need SHALL', () => {
  assert.equal(souls('Users log in with email.'), 1);
  assert.equal(souls('- Show profile of hospitals'), 1);
});
test('word-level ghosts still run on exempt lines', () => {
  assert.equal(analyze('**Stakeholder:** users who want a fast and easy flow').findings.length, 2);
});
