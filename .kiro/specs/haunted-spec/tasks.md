# Implementation Tasks

This is an ordered checklist for implementing Haunted Spec. Each task references the requirements it satisfies. Complete tasks in order: core + tests first, then CLI, then UI shell, then polish.

## Phase 1: Core Analyzer

- [x] 1. Set up project structure and package.json
  - [x] 1.1 Create folder structure: `src/core/`, `src/ui/`, `bin/`, `test/`, `styles/`
  - [x] 1.2 Create `package.json` with `"type": "module"`, `fast-check` dev dependency, `"scripts": { "test": "node --test test/**/*.mjs" }`
  - [x] 1.3 Create `.gitignore` (node_modules, .DS_Store, coverage)
  - _Requirements: 1.1, 23.1_

- [x] 2. Implement tokenizer
  - [x] 2.1 Write `src/core/tokenize.mjs`: `tokenize(text)` splits on newlines, returns `Line[]` with `{ text, index, offset, type }`
  - [x] 2.2 Implement `classifyLine(line)`: detect heading (starts with `#`), blank (whitespace only), user story (matches `As a .., I want .., so that`), else requirement
  - [x] 2.3 Write `test/tokenize.test.mjs`: test empty input, single line, multiline, heading detection, user story detection
  - _Requirements: 1.1, 2.8_

- [x] 3. Implement ghost detection rules
  - [x] 3.1 Write `src/core/ghosts.mjs`: export `GHOSTS` array with 7 ghost definitions (id, name, color, severity, pattern, message, suggest)
  - [x] 3.2 Implement `detectGhosts(line)`: run all patterns on requirement lines, return `Finding[]`
  - [x] 3.3 Write `test/ghosts.test.mjs`: test each ghost detection rule with known examples and edge cases
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 4. Implement analyzer
  - [x] 4.1 Write `src/core/analyze.mjs`: `analyze(text)` tokenizes, classifies, detects ghosts, calculates score, returns `Report`
  - [x] 4.2 Write `test/analyze.test.mjs`: test full analysis on sample requirements, verify findings, score, band
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 5. Implement haunt score
  - [x] 5.1 Write `src/core/score.mjs`: `calculateScore(findings, requirementLineCount)` computes weighted sum, normalizes, scales to 0-100
  - [x] 5.2 Implement `getBand(score)`: return Purified/Restless/Haunted/Cursed
  - [x] 5.3 Tune `scaleFactor` so ~3 severity-2 findings per line → score ~50
  - [x] 5.4 Write `test/score.test.mjs`: test score bounds, band thresholds, zero requirement lines case
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 6. Implement exorcism transformations
  - [x] 6.1 Write `src/core/exorcise.mjs`: `exorcise(text, finding)` applies ghost-specific rewrite
  - [x] 6.2 Implement transformation for each ghost: wraith → SHALL, poltergeist → remove/replace, specter → placeholder, faceless → THE SYSTEM SHALL, wandering-soul → EARS template, banshee → bounded placeholder, two-headed → split
  - [x] 6.3 Implement `exorciseAll(text)`: analyze, exorcise all findings in reverse order
  - [x] 6.4 Write `test/exorcise.test.mjs`: test each transformation, test exorciseAll
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.1, 6.2, 6.3_

- [x] 7. Implement EARS transformations
  - [x] 7.1 Write `src/core/ears.mjs`: `toEars(line)` converts user story or plain requirement to EARS format
  - [x] 7.2 Implement `toKiroRequirements(text)`: generate Kiro `requirements.md` structure with headings, user stories, acceptance criteria
  - [x] 7.3 Write `test/ears.test.mjs`: test user story conversion, plain requirement wrapping, Kiro export format
  - _Requirements: 8.1, 8.2, 8.3, 9.1, 9.2, 9.3, 9.4_

- [x] 8. Write property-based tests
  - [x] 8.1 Write `test/properties.test.mjs`: import `fast-check`
  - [x] 8.2 Write property test for Property 1 (Determinism)
  - [x] 8.3 Write property test for Property 2 (Score Bounds)
  - [x] 8.4 Write property test for Property 3 (Monotonicity - Removal)
  - [x] 8.5 Write property test for Property 4 (Monotonicity - Addition)
  - [x] 8.6 Write property test for Property 5 (Idempotency - Exorcise All)
  - [x] 8.7 Write property test for Property 6 (Idempotency - Single Exorcism)
  - [x] 8.8 Write property test for Property 7 (Exorcise All Reduces Score)
  - [x] 8.9 Write property test for Property 8 (Line Classification Consistency)
  - [x] 8.10 Write property test for Property 9 (Ghost Detection Completeness)
  - [x] 8.11 Write property test for Property 10 (No False Positives on Headings)
  - [x] 8.12 Write property test for Property 11 (Score Zero When No Requirements)
  - _Requirements: 4.1, 4.2, 4.3, 7.1, 7.2_

## Phase 2: CLI

- [x] 9. Implement CLI tool
  - [x] 9.1 Write `bin/haunt.mjs`: shebang `#!/usr/bin/env node`, import analyzer, read file from `process.argv[2]`
  - [x] 9.2 Parse `--max <threshold>` flag, default to 100
  - [x] 9.3 Parse `--json` flag, output full report as JSON if set
  - [x] 9.4 Parse `--help` flag, print usage and exit 0
  - [x] 9.5 Run analyzer, print score and band, exit 0 if score ≤ threshold, else exit 1
  - [x] 9.6 Handle file read errors: print to stderr, exit 2
  - [x] 9.7 Chmod +x `bin/haunt.mjs`
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

- [x] 10. Test CLI
  - [x] 10.1 Create sample cursed file `test/fixtures/cursed.md`
  - [x] 10.2 Create sample purified file `test/fixtures/purified.md`
  - [x] 10.3 Write shell script or Node test that runs CLI on fixtures and asserts exit codes
  - _Requirements: 22.1, 22.2_

## Phase 3: UI Shell

- [x] 11. Set up HTML and CSS structure
  - [x] 11.1 Create `index.html`: DOCTYPE, meta viewport, title, link stylesheets, script tag for `src/ui/app.mjs` with `type="module"`
  - [x] 11.2 Create `styles/reset.css`: minimal CSS reset
  - [x] 11.3 Create `styles/variables.css`: CSS custom properties for colors, spacing, font stacks (Georgia, monospace)
  - [x] 11.4 Create `styles/layout.css`: grid layout (left editor, right graveyard, top meter)
  - [x] 11.5 Ensure all asset paths are relative (no leading `/`)
  - _Requirements: 23.1, 23.2, 24.3_

- [x] 12. Implement grimoire editor
  - [x] 12.1 Write `src/ui/editor.mjs`: render textarea with line numbers gutter
  - [x] 12.2 Add overlay div for ghost word highlighting, synchronized with textarea scroll
  - [x] 12.3 On textarea input, re-run analyzer and update overlay within 200ms (debounce)
  - [x] 12.4 Highlight matched substrings with ghost color and underline
  - [x] 12.5 On click on highlighted word, emit event to open exorcism card
  - [x] 12.6 Ensure visible focus indicator on textarea (2px solid border)
  - [x] 12.7 Write `styles/editor.css`: editor layout, line numbers, overlay styles
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 13. Implement haunt meter
  - [x] 13.1 Write `src/ui/meter.mjs`: render moon SVG that transitions color based on score
  - [x] 13.2 Display numeric score and band label
  - [x] 13.3 Add ARIA live region `aria-live="polite"` for score announcements
  - [x] 13.4 On score change, update live region with "Haunt score: <score>, <band>"
  - [x] 13.5 Write `styles/meter.css`: moon graphic, score label, live region (visually hidden but announced)
  - _Requirements: 14.1, 14.2, 14.3, 19.1_

- [x] 14. Implement graveyard scene
  - [x] 14.1 Write `src/ui/graveyard.mjs`: render one tombstone SVG per requirement line, engraved with line number
  - [x] 14.2 For each finding, render ghost SVG above corresponding tombstone, using ghost color and silhouette
  - [x] 14.3 Offset multiple ghosts horizontally to avoid overlap
  - [x] 14.4 Add hover tooltip with ghost name and matched text
  - [x] 14.5 Make ghosts focusable: `role="button"`, `tabindex="0"`, `aria-label` with ghost type, line, match
  - [x] 14.6 On click or Enter on ghost, emit event to open exorcism card
  - [x] 14.7 When score is 0, remove ghosts and lift fog effect
  - [x] 14.8 Respect `prefers-reduced-motion`: disable drifting animations
  - [x] 14.9 Write `styles/graveyard.css`: graveyard scene, tombstones, ghosts, fog, animations
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 19.3_

- [x] 15. Implement exorcism card
  - [x] 15.1 Write `src/ui/card.mjs`: render modal with ghost name, full line with highlighted match, reason, suggestion
  - [x] 15.2 Add "Exorcise" button: apply exorcism, close modal, update editor text
  - [x] 15.3 Add "Ignore" button: close modal without change
  - [x] 15.4 Add close button (X) and handle Esc key to close
  - [x] 15.5 Trap focus within modal: Tab cycles through buttons
  - [x] 15.6 Use `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to ghost name
  - [x] 15.7 On successful exorcism, announce in ARIA live region: "Ghost exorcised. Haunt score now <score>."
  - [x] 15.8 Write `styles/components.css`: modal dialog, card layout, buttons
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 19.2_

- [x] 16. Implement bestiary drawer
  - [x] 16.1 Write `src/ui/bestiary.mjs`: render drawer with all 7 ghost types, color swatch, description, count
  - [x] 16.2 Display count 0 for ghosts with no findings
  - [x] 16.3 Add toggle button to open/close drawer
  - [x] 16.4 On click ghost entry, filter graveyard to show only that ghost type (optional feature, low priority)
  - [x] 16.5 Use `role="region"`, `aria-label="Ghost Bestiary"`
  - [x] 16.6 Write styles for drawer, toggle button, ghost list
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 19.5_

- [x] 17. Implement export and share
  - [x] 17.1 Write `src/ui/export.mjs`: export current text as `requirements.md` download
  - [x] 17.2 Add "Copy to Clipboard" button using `navigator.clipboard.writeText`
  - [x] 17.3 Add "Share Link" button: encode text in URL hash using `encodeURIComponent(btoa(text))`
  - [x] 17.4 On page load, check for URL hash, decode and populate editor
  - [x] 17.5 Add "Copy Link" button: copy share URL to clipboard
  - [x] 17.6 Add "Export Kiro Format" button: call `toKiroRequirements`, display in modal or download
  - _Requirements: 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 18. Implement persistence
  - [x] 18.1 On editor text change, save to localStorage key `"haunted-spec-text"` (debounce 1s)
  - [x] 18.2 On page load, if no URL hash, retrieve from localStorage and populate editor
  - [x] 18.3 If localStorage unavailable, catch exception, show toast warning, disable persistence
  - [x] 18.4 If no stored text and no URL hash, populate with default sample
  - _Requirements: 11.1, 11.2, 11.3, 23.5_

- [x] 19. Implement sample cursed scrolls
  - [x] 19.1 Write `src/ui/samples.mjs`: define at least 3 sample requirements documents (login, checkout, pumpkin delivery)
  - [x] 19.2 Render samples menu with list of sample names
  - [x] 19.3 On sample selection, back up current editor text to localStorage with timestamp key
  - [x] 19.4 Load sample into editor, re-run analyzer
  - [x] 19.5 Add "Restore previous" button to reload backed-up text
  - _Requirements: 17.1, 17.2, 17.3_

- [x] 20. Implement main UI orchestrator
  - [x] 20.1 Write `src/ui/app.mjs`: initialize all UI modules (editor, meter, graveyard, card, bestiary, export, samples)
  - [x] 20.2 Wire up event listeners: editor input → re-analyze → update meter + graveyard + overlay
  - [x] 20.3 Wire up ghost click → open exorcism card
  - [x] 20.4 Wire up exorcism button → apply exorcism → update editor → re-analyze
  - [x] 20.5 Wire up export/share buttons → download/copy/share
  - [x] 20.6 On page load, check URL hash or localStorage, populate editor, run initial analysis
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 11.2_

## Phase 4: Polish and Accessibility

- [x] 21. Create ghost SVG silhouettes
  - [x] 21.1 Design inline SVG for Specter of Vagueness (purple, wispy robes)
  - [x] 21.2 Design inline SVG for Poltergeist of Ambiguity (orange, jagged)
  - [x] 21.3 Design inline SVG for Wraith of Weak Will (blue, translucent)
  - [x] 21.4 Design inline SVG for Faceless Ghoul (gray, featureless)
  - [x] 21.5 Design inline SVG for Banshee of Absolutes (red, screaming)
  - [x] 21.6 Design inline SVG for Wandering Soul (teal, orb)
  - [x] 21.7 Design inline SVG for Two-Headed Beast (amber, two heads)
  - [x] 21.8 Embed SVGs in `src/ui/graveyard.mjs` or `styles/graveyard.css` as data URIs
  - _Requirements: 24.1_

- [x] 22. Implement reduced motion support
  - [x] 22.1 Add CSS media query `@media (prefers-reduced-motion: reduce)` in `styles/graveyard.css`
  - [x] 22.2 Disable drifting/floating animations for ghosts and fog when reduced motion is active
  - [x] 22.3 Use instant transitions instead of fades
  - [x] 22.4 Make purification celebration static (no animated particles)
  - [x] 22.5 Test in browser with reduced motion enabled
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

- [x] 23. Keyboard accessibility audit
  - [x] 23.1 Test full keyboard navigation: Tab through all interactive elements in logical order
  - [x] 23.2 Ensure all focusable elements have visible focus indicator (2px solid, 3:1 contrast)
  - [x] 23.3 Test Enter/Space on ghosts to open exorcism card
  - [x] 23.4 Test Esc to close exorcism card
  - [x] 23.5 Test focus trap in exorcism card modal
  - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [x] 24. Contrast audit
  - [x] 24.1 Check all text on dark graveyard background (`#1a1a2e`): ensure 4.5:1 for normal text, 3:1 for large text
  - [x] 24.2 Check ghost colors on graveyard background: ensure 3:1 contrast for silhouettes
  - [x] 24.3 Check editor text (`#ffffff` on `#2d2d44`): ensure 4.5:1
  - [x] 24.4 Check focus indicators: ensure 3:1 contrast against element and page backgrounds
  - [x] 24.5 Use browser DevTools or online contrast checker to verify all ratios
  - _Requirements: 20.1, 20.2, 20.3, 20.4_

- [x] 25. Optional ambient sound
  - [x] 25.1 Write `src/ui/audio.mjs`: synthesize ambient drone using Web Audio API (OscillatorNode + GainNode)
  - [x] 25.2 Add toggle button (off by default) to enable/disable sound
  - [x] 25.3 Ensure no external audio files are used
  - _Requirements: 24.2_

- [x] 26. Purification celebration
  - [x] 26.1 When score reaches 0, trigger celebration: fog lifts, moon turns silver, optional confetti (CSS particles or canvas)
  - [x] 26.2 Respect `prefers-reduced-motion`: static celebration (no animation)
  - [x] 26.3 Announce in ARIA live region: "Purified! Haunt score: 0."
  - _Requirements: 14.4, 21.4_

- [x] 27. GitHub Pages deployment
  - [x] 27.1 Create `.github/workflows/deploy.yml`: build (if any) and deploy to gh-pages branch
  - [x] 27.2 Set base path in HTML if needed (or ensure all paths are relative)
  - [x] 27.3 Test deployment at `https://<username>.github.io/haunted-spec/`
  - [x] 27.4 Verify all assets load, ES modules work, localStorage works, no 404s
  - _Requirements: 23.2, 23.3, 23.4_

## Phase 5: Documentation and Dogfooding

- [x] 28. Write README
  - [x] 28.1 Add project overview, features, screenshots (or ASCII art graveyard)
  - [x] 28.2 Add usage instructions: web UI, CLI, examples
  - [x] 28.3 Add Ghost Bestiary table with all 7 ghosts, colors, descriptions
  - [x] 28.4 Add development setup: `npm install`, `npm test`, `npm run dev` (if dev server)
  - [x] 28.5 Add contributing guidelines (optional)
  - [x] 28.6 Add license (MIT or similar)

- [x] 29. Dogfood: lint this spec
  - [x] 29.1 Run `node bin/haunt.mjs .kiro/specs/haunted-spec/requirements.md --max 10`
  - [x] 29.2 If haunted, manually exorcise findings in requirements.md
  - [x] 29.3 Re-run until score ≤ 10
  - [x] 29.4 Verify that acceptance criteria pass the linter (no vague words)

- [x] 30. Final testing
  - [x] 30.1 Run full test suite: `npm test` (all tests pass)
  - [x] 30.2 Manual UI test: load UI, paste sample, exorcise ghosts, export, share link
  - [x] 30.3 Test on Firefox, Chrome, Safari (or at least 2 browsers)
  - [x] 30.4 Test keyboard-only navigation
  - [x] 30.5 Test with screen reader (optional but recommended)
  - [x] 30.6 Test from GitHub Pages URL (all features work)
