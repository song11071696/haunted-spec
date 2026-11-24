---
inclusion: fileMatch
fileMatchPattern: "test/**/*.mjs"
---

# Testing

## Test Framework
- **Unit tests**: Node.js built-in test runner (`node --test`)
- **Property-based tests**: `fast-check` (dev dependency)
- Run all tests with: `npm test` (or `node --test test/**/*.mjs`)

## Writing Unit Tests

### Structure
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { functionToTest } from '../src/core/module.mjs';

test('descriptive test name', () => {
  const input = /* ... */;
  const expected = /* ... */;
  const actual = functionToTest(input);
  assert.deepEqual(actual, expected);
});
```

### Guidelines
- One test file per core module: `test/<module-name>.test.mjs`
- Test names describe behavior: "returns empty array for empty input", "detects Specter in 'load fast'"
- Use `assert.deepEqual` for objects/arrays, `assert.equal` for primitives
- Test edge cases: empty input, single line, no findings, all findings
- Keep tests deterministic: no random data, no timestamps, no network
- Tests should be fast: entire suite under 500ms

## Writing Property-Based Tests

### Structure
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { functionToTest } from '../src/core/module.mjs';

test('Property N: description', () => {
  fc.assert(
    fc.property(
      fc.string(), // arbitrary generator
      (input) => {
        const result = functionToTest(input);
        // assertion about the property
        assert.ok(result.someInvariant);
      }
    ),
    { numRuns: 100 } // optional config
  );
});
```

### Properties to Test
See `design.md` Correctness Properties section. Each numbered property should have a corresponding test in `test/properties.test.mjs`.

Examples:
- **Monotonicity**: For any text T and finding F in analyze(T), score(analyze(T)) ≥ score(analyze(exorcise(T, F)))
- **Idempotency**: For any text T, exorciseAll(exorciseAll(T)) = exorciseAll(T)
- **Determinism**: For any text T, analyze(T) = analyze(T)
- **Score bounds**: For any text T, 0 ≤ score(analyze(T)) ≤ 100

### Generators
Use `fast-check` arbitraries appropriate for requirements text:
- `fc.string()`: any string
- `fc.array(fc.string())`: array of lines
- `fc.lorem()`: prose-like text
- Custom: requirements-like strings with known ghost patterns

### Fast-Check Tips
- Keep properties simple and focused
- Use `.filter()` to constrain input (e.g., non-empty strings)
- Use `numRuns: 100` for fast feedback (default is 100)
- Use `seed` for reproducible failures during debugging
- Shrinking: fast-check will find minimal failing case

## Test Organization

```
test/
├── tokenize.test.mjs       # Unit tests for tokenize/classifyLine
├── ghosts.test.mjs         # Unit tests for each ghost rule
├── analyze.test.mjs        # Unit tests for analyze()
├── score.test.mjs          # Unit tests for score()
├── exorcise.test.mjs       # Unit tests for exorcise/exorciseAll
├── ears.test.mjs           # Unit tests for EARS transformations
└── properties.test.mjs     # Property-based tests for all properties
```

## Running Tests

```bash
# Run all tests
npm test

# Run a single test file
node --test test/analyze.test.mjs

# Run with coverage (Node 20+)
node --test --experimental-test-coverage test/**/*.mjs
```

## Dogfooding: Testing the Linter with Itself

The CLI (`bin/haunt.mjs`) is used in a Kiro hook to lint our own spec:
```bash
node bin/haunt.mjs .kiro/specs/haunted-spec/requirements.md --max 10
```

If the spec is haunted, the hook triggers an agent to fix it. This ensures our acceptance criteria are themselves unambiguous and testable.
