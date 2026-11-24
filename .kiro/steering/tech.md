---
inclusion: always
---

# Tech Stack and Constraints

## Stack
- HTML5
- CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript ES modules (native `import`/`export`)
- Node.js built-in test runner (`node --test`)
- `fast-check` (dev dependency only, for property-based tests)
- Web Audio API (for optional ambient sound, synthesized, off by default)

## Hard Constraints

### Static and Offline
- No build step, no bundler, no transpilation
- No backend, no API keys, no network calls at runtime
- No external CDNs, no external fonts
- Must work when served from GitHub Pages under a sub-path (`/haunted-spec/`)
- Use relative paths for all assets and module imports

### Architecture
- Analyzer core (`src/core/`) is pure, deterministic, DOM-free
- Core modules export plain functions that can run in Node.js
- UI modules (`src/ui/`) handle DOM and browser APIs
- Core and UI are separate: no circular dependencies

### Testing
- Unit tests use `node --test` (built-in test runner)
- Property-based tests use `fast-check`
- All tests run in Node.js (no browser harness)
- Tests must be fast (<500ms total)
- CLI (`bin/haunt.mjs`) uses the same core analyzer

### Assets
- All graphics are inline SVG or CSS-generated
- No copyrighted assets
- System fonts only: serif (Georgia, "Times New Roman"), monospace (system monospace), sans-serif (system default)

### Dependencies
- Zero runtime dependencies (no `node_modules` shipped)
- Dev dependencies allowed: `fast-check`, `@types/*` (optional)
- Lock exact versions in `package.json`
