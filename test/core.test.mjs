import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyze, tokenize, classifyLine, detectGhosts, GHOSTS, calculateScore, getBand,
  exorcise, exorciseAll, toEars, toKiroRequirements, parseStory,
} from '../src/core/index.mjs';

const ghostsOf = (s) => analyze(s).findings.map((f) => f.ghostId);

test('tokenize classifies headings, blanks, stories, requirements, code and notes', () => {
  const lines = tokenize('# Title\n\nAs a user, I want to log in, so that I can work.\n- THE SYSTEM SHALL log in users.\n```\ncode should be ignored\n```\nok');
  assert.deepEqual(lines.map((l) => l.type), ['heading', 'blank', 'userStory', 'requirement', 'code', 'code', 'code', 'note']);
  assert.equal(tokenize('').length, 0);
});

test('classifyLine treats bold labels and tables as non-requirements', () => {
  assert.equal(classifyLine('**Acceptance Criteria**'), 'heading');
  assert.equal(classifyLine('| a | b | c |'), 'meta');
  assert.equal(classifyLine('**User Story:** As a cook, I want recipes, so that I eat.'), 'userStory');
});

test('every ghost has the metadata the UI needs', () => {
  assert.equal(GHOSTS.length, 7);
  for (const g of GHOSTS) {
    for (const k of ['id', 'name', 'color', 'severity', 'silhouette', 'summary', 'why']) assert.ok(g[k], `${g.id} missing ${k}`);
    assert.match(g.color, /^#[0-9a-f]{6}$/i);
  }
});

test('Specter of Vagueness catches unmeasurable adjectives', () => {
  const f = analyze('THE SYSTEM SHALL load the page fast and be user-friendly.').findings;
  assert.deepEqual(f.map((x) => x.match), ['fast', 'user-friendly']);
  assert.ok(f.every((x) => x.ghostId === 'specter-of-vagueness'));
});

test('Poltergeist of Ambiguity catches quantifiers and escape hatches', () => {
  const f = analyze('THE SYSTEM SHALL notify some users by email, SMS etc. (TBD)').findings.map((x) => x.match);
  assert.deepEqual(f, ['some', 'etc.', 'TBD']);
});

test('Wraith of Weak Will catches weak modals and owns the line (no Wandering Soul)', () => {
  const ids = ghostsOf('The app should save drafts.');
  assert.deepEqual(ids, ['wraith-of-weak-will']);
});

test('Faceless Ghoul catches passive voice without an actor but not with "by"', () => {
  assert.ok(ghostsOf('THE SYSTEM SHALL ensure that an email is sent.').includes('faceless-ghoul'));
  assert.ok(!ghostsOf('THE SYSTEM SHALL ensure that an email is sent by the mailer.').includes('faceless-ghoul'));
  assert.ok(!ghostsOf('THE SYSTEM SHALL ensure that the user is required to agree.').includes('faceless-ghoul'));
});

test('Banshee of Absolutes catches untestable absolutes', () => {
  const f = analyze('THE SYSTEM SHALL always respond instantly with 100% accuracy.').findings.map((x) => x.match);
  assert.deepEqual(f, ['always', 'instantly', '100%']);
});

test('Wandering Soul flags sentences with no SHALL, skipping the bullet', () => {
  const [f] = analyze('- Users log in with email.').findings;
  assert.equal(f.ghostId, 'wandering-soul');
  assert.equal(f.start, 2);
});

test('Two-Headed Beast flags compound SHALL statements', () => {
  assert.deepEqual(ghostsOf('THE SYSTEM SHALL save the file and email the owner.'), ['two-headed-beast']);
  assert.deepEqual(ghostsOf('THE SYSTEM SHALL save the file and SHALL notify the owner.'), ['two-headed-beast']);
});

test('placeholders and inline code are never re-haunted', () => {
  assert.deepEqual(ghostsOf('THE SYSTEM SHALL respond ‹measurable: fast› using `should()`.'), []);
});

test('headings and code are not linted; user stories are judged on their words, not their shape', () => {
  assert.equal(analyze('# Fast and easy\n```\nshould be fast\n```').findings.length, 0);
  assert.deepEqual(ghostsOf('As a user, I want to check out quickly, so that I am happy.'), ['specter-of-vagueness']);
  assert.deepEqual(ghostsOf('As a user, I want to check out in 3 steps, so that I am happy.'), []);
});

test('score: 0 for clean text, bounded, and banded', () => {
  assert.equal(analyze('THE SYSTEM SHALL save drafts within 2 s.').score, 0);
  assert.equal(calculateScore([], 0), 0);
  assert.equal(calculateScore([{ severity: 3, lineIndex: 0 }, { severity: 3, lineIndex: 0 }, { severity: 3, lineIndex: 0 }], 1), 100);
  assert.equal(getBand(0), 'Purified');
  assert.equal(getBand(10), 'Purified');
  assert.equal(getBand(11), 'Restless');
  assert.equal(getBand(50), 'Haunted');
  assert.equal(getBand(90), 'Cursed');
});

test('exorcise applies a single fix and ignores stale findings', () => {
  const text = 'The app should save drafts.';
  const [f] = analyze(text).findings;
  assert.equal(exorcise(text, f), 'The app SHALL save drafts.');
  assert.equal(exorcise('different text now', f), 'different text now');
});

test('exorciseAll purifies a cursed scroll', () => {
  const cursed = [
    'The login page should load fast and be user-friendly.',
    'A confirmation email is sent after signup etc.',
    'THE SYSTEM SHALL save the cart and email the receipt.',
    'Sessions never expire.',
  ].join('\n');
  const before = analyze(cursed).score;
  const purified = exorciseAll(cursed);
  assert.ok(before > 50);
  assert.equal(analyze(purified).score, 0);
  assert.match(purified, /SHALL save the cart\.\nTHE SYSTEM SHALL email the receipt\./);
});

test('parseStory and toEars', () => {
  assert.deepEqual(parseStory('As a shopper, I want to pay with a card, so that I can check out.'),
    { role: 'shopper', goal: 'pay with a card', benefit: 'I can check out' });
  assert.equal(toEars('As a shopper, I want to save my cart, so that I keep it.'),
    'WHEN the shopper chooses to save their cart, THE SYSTEM SHALL let the shopper save their cart.');
  assert.equal(toEars('Users log in with email.'), 'THE SYSTEM SHALL ensure that users log in with email.');
  assert.equal(toEars('When the timer ends, play a sound.'), 'WHEN the timer ends, THE SYSTEM SHALL play a sound.');
});

test('toKiroRequirements emits the Kiro spec structure', () => {
  const md = toKiroRequirements('## Checkout\nAs a shopper, I want to pay, so that I get my pumpkin.\n- Payment should be fast.');
  assert.match(md, /^# Requirements Document\n/);
  assert.match(md, /## Introduction/);
  assert.match(md, /### Requirement 1: Checkout/);
  assert.match(md, /\*\*User Story:\*\* As a shopper, I want to pay, so that I get my pumpkin/);
  assert.match(md, /#### Acceptance Criteria\n\n1\. WHEN the shopper/);
  assert.match(md, /2\. Payment SHALL be ‹measurable: within 2 s at p95›\./);
});

test('detectGhosts returns findings sorted by position with stable ids', () => {
  const f = detectGhosts({ text: 'it should be fast', index: 3, bodyStart: 0 });
  assert.deepEqual(f.map((x) => x.start), [3, 13]);
  assert.equal(f[0].id, 'wraith-of-weak-will@3:3');
});

test('quoted words are mentions, not hauntings', () => {
  assert.deepEqual(ghostsOf('WHEN the text contains "should", THE SYSTEM SHALL flag the line.'), []);
  assert.deepEqual(ghostsOf("WHEN the text contains 'fast', THE SYSTEM SHALL flag the line."), []);
  assert.deepEqual(ghostsOf("THE SYSTEM SHALL keep the user's draft fast."), ['specter-of-vagueness']);
});

test('Introduction and Glossary sections are prose, not requirements', () => {
  const r = analyze('## Introduction\nThis tool is fast and easy.\n## Requirements\nThe tool is fast.');
  assert.deepEqual(r.lines.map((l) => l.type), ['heading', 'prose', 'heading', 'requirement']);
  assert.equal(r.stats.requirementLines, 1);
});

test('sub-headings inside a prose section stay prose', () => {
  const r = analyze('## Introduction\n### Purpose\nMake it fast and easy.\n## Requirements\n### Requirement 1\nIt is fast.');
  assert.deepEqual(r.lines.map((l) => l.type), ['heading', 'heading', 'prose', 'heading', 'heading', 'requirement']);
});
