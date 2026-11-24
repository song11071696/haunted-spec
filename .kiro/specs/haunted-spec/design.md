# Design Document

## Overview

Haunted Spec is a static requirements linter with a spooky UI. The analyzer core is pure and testable in Node.js; the UI is a browser-based graveyard scene. The design prioritizes determinism, testability, and accessibility.

## Architecture

### Core vs UI Separation

**Core (`src/core/`)**: Pure, deterministic, DOM-free modules. All logic for detection, scoring, and transformation lives here. These modules export plain functions that operate on strings, arrays, and objects. No side effects, no browser APIs.

**UI (`src/ui/`)**: Browser-specific modules that render the graveyard, editor, and controls. UI modules import core modules but core modules never import UI modules.

### Data Flow

```
User Input (textarea)
  ↓
Editor (src/ui/editor.mjs)
  ↓
Analyzer (src/core/analyze.mjs)
  ↓
Report { lines, findings, score, band }
  ↓
UI Update:
  - Graveyard (src/ui/graveyard.mjs) renders tombstones + ghosts
  - Meter (src/ui/meter.mjs) renders moon + score
  - Editor overlay highlights ghost words
  ↓
User clicks ghost
  ↓
Exorcism Card (src/ui/card.mjs)
  ↓
Exorcise (src/core/exorcise.mjs)
  ↓
Updated text → re-analyze
```

## Components and Interfaces

### src/core/tokenize.mjs

```javascript
export function tokenize(text: string): Line[]
// Splits text into lines (preserving original text, line number, and offset)

export function classifyLine(line: string): LineType
// Returns: 'heading' | 'blank' | 'userStory' | 'requirement'
```

**Line type**: `{ text: string, index: number, offset: number, type: LineType }`

### src/core/ghosts.mjs

```javascript
export const GHOSTS = [
  {
    id: 'specter-of-vagueness',
    name: 'Specter of Vagueness',
    color: '#9B59B6',
    severity: 2,
    pattern: /(fast|quick|easy|simple|user-friendly|intuitive|robust|scalable|seamless|efficient|flexible|modern|responsive|reliable|secure|performant)/gi,
    message: (match) => `Replace '${match}' with a measurable target, e.g., 'within 2 seconds at p95'`,
    suggest: (match) => `‹measurable: e.g., within 2 seconds›`
  },
  // ... 6 more ghosts
];

export function detectGhosts(line: Line): Finding[]
// Runs all ghost patterns on a requirement line, returns findings
```

**Finding type**: `{ ghostId: string, lineIndex: number, start: number, end: number, match: string, severity: number, message: string, suggestion: string }`

### src/core/analyze.mjs

```javascript
export function analyze(text: string): Report
// Main entry point: tokenize, classify, detect, score
```

**Report type**: `{ lines: Line[], findings: Finding[], score: number, band: string }`

### src/core/score.mjs

```javascript
export function calculateScore(findings: Finding[], requirementLineCount: number): number
// Returns haunt score 0-100

export function getBand(score: number): string
// Returns: 'Purified' | 'Restless' | 'Haunted' | 'Cursed'
```

**Score formula**:
```
weightedSum = sum(finding.severity for finding in findings)
perLine = weightedSum / max(requirementLineCount, 1)
score = min(perLine * scaleFactor, 100)
```

Where `scaleFactor` is tuned such that ~3 severity-2 findings per line → score ~50.

### src/core/exorcise.mjs

```javascript
export function exorcise(text: string, finding: Finding): string
// Applies ghost-specific transformation to remove or rewrite the finding

export function exorciseAll(text: string): string
// Runs analyze, then exorcises all findings in reverse order (last to first by position)
```

### src/core/ears.mjs

```javascript
export function toEars(line: string): string
// Converts a user story or plain requirement to EARS format

export function toKiroRequirements(text: string): string
// Converts analyzed text to Kiro requirements.md format
```

## Ghost Rule Table

| Ghost ID | Pattern | Severity | Exorcism Transform |
|---|---|---|---|
| `specter-of-vagueness` | unmeasurable adjectives (fast, easy, etc.) | 2 | Replace with `‹measurable: e.g., <example>›` |
| `poltergeist-of-ambiguity` | vague quantifiers (some, etc., TBD, and/or) | 2 | Remove phrase or replace with `‹specify: e.g., <example>›` |
| `wraith-of-weak-will` | weak modals (should, may, could) | 3 | Replace with `SHALL` |
| `faceless-ghoul` | passive voice without actor | 2 | Rewrite as `THE SYSTEM SHALL <verb>` |
| `banshee-of-absolutes` | untestable absolutes (always, never, 100%) | 3 | Replace with `‹bounded: e.g., <example>›` |
| `wandering-soul` | requirement line with no SHALL or EARS trigger | 1 | Wrap in `WHEN <trigger>, THE SYSTEM SHALL <text>` |
| `two-headed-beast` | compound requirement (multiple SHALLs or "and shall") | 3 | Split into two sentences |

## Correctness Properties

These properties are designed for property-based testing with `fast-check`. Each property is numbered and mapped to the requirement it validates.

### Property 1: Determinism (validates Requirement 1.5)

**Statement**: For any text T, `analyze(T)` returns the same findings and score on every invocation.

**Test**: Generate arbitrary strings, call `analyze` twice, assert deep equality of results.

### Property 2: Score Bounds (validates Requirement 3.3, 3.4)

**Statement**: For any text T, `0 ≤ score(analyze(T)) ≤ 100`.

**Test**: Generate arbitrary strings, call `analyze`, assert `0 <= result.score <= 100`.

### Property 3: Monotonicity - Removal (validates Requirement 4.1)

**Statement**: For any text T and finding F in analyze(T), `score(analyze(exorcise(T, F))) ≤ score(analyze(T))`.

**Test**: Generate text with known ghosts, pick a finding, exorcise it, assert score does not increase.

### Property 4: Monotonicity - Addition (validates Requirement 4.2)

**Statement**: For any text T and ghost pattern G, inserting G into T produces `score ≥ original score`.

**Test**: Generate clean text, insert a known ghost word, assert score increases or stays the same.

### Property 5: Idempotency - Exorcise All (validates Requirement 7.1)

**Statement**: For any text T, `exorciseAll(exorciseAll(T)) === exorciseAll(T)`.

**Test**: Generate arbitrary text, apply `exorciseAll` twice, assert string equality.

### Property 6: Idempotency - Single Exorcism (validates Requirement 7.2)

**Statement**: For any text T and finding F, after `T' = exorcise(T, F)`, `analyze(T')` does not contain a finding of the same ghost type at the same position.

**Test**: Generate text with known ghost, exorcise it, re-analyze, assert the finding is gone or moved.

### Property 7: Exorcise All Reduces Score (validates Requirement 6.3)

**Statement**: For any text T, `score(analyze(exorciseAll(T))) ≤ score(analyze(T))`.

**Test**: Generate arbitrary text, exorcise all, assert score does not increase.

### Property 8: Line Classification Consistency (validates Requirement 1.1)

**Statement**: For any text T, the number of lines returned by `tokenize(T)` equals the number of newlines in T plus one.

**Test**: Generate arbitrary text, count newlines, assert line count matches.

### Property 9: Ghost Detection Completeness (validates Requirement 2.1-2.7)

**Statement**: For any text T containing a known ghost pattern, `analyze(T)` returns at least one finding with the corresponding ghost ID.

**Test**: Generate text with a known ghost word (e.g., "should", "fast"), assert findings include that ghost.

### Property 10: No False Positives on Headings (validates Requirement 2.8)

**Statement**: For any text T where all lines are headings (start with `#`), `analyze(T)` returns zero findings.

**Test**: Generate text with only markdown headings, assert findings array is empty.

### Property 11: Score Zero When No Requirements (validates Requirement 3.4)

**Statement**: For any text T containing only headings, blank lines, and user stories (no requirement lines), `score(analyze(T)) === 0`.

**Test**: Generate text with only headings and user stories, assert score is 0.

### Property 12: EARS Idempotency (validates Requirement 8.3)

**Statement**: For any line L already in EARS form (contains "SHALL"), `toEars(L) === L`.

**Test**: Generate EARS statements, apply `toEars`, assert no change.

## Error Handling

### Core Modules
- **Invalid input**: Core functions accept strings and return structured data. Empty strings are valid input (return empty findings, score 0).
- **Malformed text**: Tokenizer handles all UTF-8 text. No parsing errors.
- **Edge cases**: Zero requirement lines, single-line input, text with only ghosts — all handled gracefully.

### UI Modules
- **localStorage unavailable**: Catch exceptions, disable persistence, show a toast warning.
- **Invalid share URL**: If URL hash cannot be decoded, ignore it and load from localStorage or default sample.
- **Large text**: Editor and graveyard may degrade performance with >10,000 lines. No hard limit enforced.

### CLI
- **File not found**: Print error to stderr, exit code 2.
- **Non-numeric threshold**: Print usage, exit code 2.
- **Standard errors**: Catch and print stack trace in development; terse message in production.

## Testing Strategy

### Unit Tests
- One test file per core module.
- Test happy path, edge cases (empty input, single line, no findings), and all ghost detection rules.
- Test exorcism transformations for each ghost type.
- Test score calculation with known inputs and expected outputs.
- Test EARS transformations with user stories and plain requirements.

### Property-Based Tests
- One test file `test/properties.test.mjs` with one test per property (Properties 1-12 above).
- Use `fast-check` arbitraries: `fc.string()`, `fc.lorem()`, custom generators for requirements-like text.
- Each property test runs 100 iterations by default.

### Integration Test
- CLI: shell script or Node test that runs `bin/haunt.mjs` on sample files and asserts exit codes.

### Manual Testing
- Load UI in browser, test keyboard navigation, screen reader announcements, reduced motion.
- Load UI from GitHub Pages sub-path, verify assets load correctly.
- Test on Firefox, Chrome, Safari.

### Dogfooding
- Kiro hook runs `bin/haunt.mjs` on this spec after every edit.
- If spec is haunted (score > 10), hook triggers agent to fix it.
- Ensures our own acceptance criteria are unambiguous.
