---
inclusion: always
---

# Project Structure

## Folder Layout

```
haunted-spec/
├── index.html              # Main UI entry point
├── styles/
│   ├── reset.css           # Minimal CSS reset
│   ├── variables.css       # CSS custom properties (colors, spacing)
│   ├── layout.css          # Grid and flexbox layout
│   ├── graveyard.css       # Graveyard scene styles
│   ├── editor.css          # Grimoire editor styles
│   └── components.css      # Cards, modals, bestiary
├── src/
│   ├── core/               # Pure analyzer modules (Node-compatible)
│   │   ├── tokenize.mjs    # Tokenize and classify lines
│   │   ├── ghosts.mjs      # Ghost rule definitions and matchers
│   │   ├── analyze.mjs     # Main analyzer: analyze(text) -> report
│   │   ├── score.mjs       # Haunt score calculation
│   │   ├── exorcise.mjs    # Auto-fix transformations
│   │   └── ears.mjs        # EARS and Kiro format transformations
│   └── ui/                 # DOM and browser modules
│       ├── editor.mjs      # Grimoire editor with overlay
│       ├── graveyard.mjs   # Graveyard scene renderer
│       ├── meter.mjs       # Haunt meter (moon) component
│       ├── card.mjs        # Exorcism card modal
│       ├── bestiary.mjs    # Bestiary drawer
│       ├── export.mjs      # Export, share, download
│       ├── samples.mjs     # Sample cursed scrolls
│       ├── audio.mjs       # Optional ambient sound (Web Audio)
│       └── app.mjs         # Main UI orchestrator
├── bin/
│   └── haunt.mjs           # CLI tool (#!/usr/bin/env node)
├── test/
│   ├── tokenize.test.mjs
│   ├── ghosts.test.mjs
│   ├── analyze.test.mjs
│   ├── score.test.mjs
│   ├── exorcise.test.mjs
│   ├── ears.test.mjs
│   └── properties.test.mjs # Property-based tests (fast-check)
├── docs/
│   └── brief.md            # Original product brief
├── .kiro/
│   ├── steering/           # Steering documents (this file)
│   ├── specs/
│   │   └── haunted-spec/   # Main spec
│   ├── hooks/              # Agent hooks (.kiro.hook files)
│   └── agents/             # Custom agents (exorcist.json)
├── package.json
├── package-lock.json
└── README.md
```

## Naming Conventions

### Files
- Modules: kebab-case, `.mjs` extension (ES modules)
- Tests: `<module-name>.test.mjs`
- Styles: kebab-case, `.css`
- Hooks: `<name>.kiro.hook` (JSON)
- Agents: `<name>.json`

### Code
- Functions: camelCase (`analyzeText`, `exorciseFinding`)
- Constants: UPPER_SNAKE_CASE (`MAX_SCORE`, `GHOST_TYPES`)
- Classes (if any): PascalCase
- Module exports: named exports preferred, default exports for single main function

### Imports
- Always use relative paths: `./module.mjs` or `../core/module.mjs`
- Never use bare specifiers in browser code
- Group imports: core modules first, then UI modules

## Module Contracts

### Core Modules (src/core/)
- Export pure functions only
- No `window`, `document`, `localStorage`, or other browser APIs
- Deterministic: same input → same output
- No side effects (no I/O, no mutation of inputs)
- Return plain objects/arrays (JSON-serializable)

### UI Modules (src/ui/)
- May import core modules
- May use browser APIs (DOM, localStorage, Web Audio)
- Export initialization or render functions
- Keep logic minimal; delegate to core when possible
