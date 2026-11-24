# Haunted Spec — original product brief (the prompt handed to Kiro)

## One-liner
Haunted Spec is a spooky, fully client-side requirements linter: paste your requirements or user stories and the
"ghosts" haunting them (ambiguity, vagueness, weak modals, untestable absolutes...) rise out of a graveyard.
Exorcise each ghost with a one-click fix, transmute lines into EARS notation, and export a Kiro-ready
`requirements.md`.

## Why (real problem)
Vague requirements are the #1 source of rework — and with AI coding agents (Kiro specs, Copilot, etc.) a vague spec
becomes vague code even faster. "The page should load fast and be user-friendly" can't be tested. Teams need a quick,
free, private tool that shows *what* is ambiguous and *how* to fix it, before the spec goes to an agent.

Audience: developers, PMs and students writing specs (especially Kiro spec-driven development users).

## Hackathon category
Kiroween 2026 — **Costume Contest**: the haunting UI is not decoration, it IS the function: every ghost is a lint
finding, the haunt meter is the quality score, exorcism is the fix.

## Hard constraints
- 100% static: HTML + CSS + vanilla JavaScript ES modules. No build step, no backend, no API keys, no network calls,
  no external CDNs/fonts. Must work when served from GitHub Pages under a sub-path (`/haunted-spec/`) — use relative paths only.
- No copyrighted assets: all art is inline SVG/CSS made in this repo; ambient sound (optional, off by default) is
  synthesized with the Web Audio API.
- Accessible: keyboard operable, visible focus, ARIA live region for score changes, `prefers-reduced-motion` turns off
  drifting/flicker animations, WCAG AA contrast for text.
- Analyzer core is pure, deterministic and DOM-free (`src/core/`), so it is unit- and property-testable in Node.
- Tests: `node --test` (built-in runner) + `fast-check` (dev dependency) for property-based tests.
- Also ship a tiny Node CLI (`bin/haunt.mjs <file.md>`) that runs the same analyzer on a markdown file and exits non-zero
  when the haunt score is above a threshold — used by our own Kiro hook to lint our own spec (dogfooding).

## The ghosts (rule set)
Each finding: `{ ghostId, line, start, end, match, severity (1-3), message, suggestion }`.

| Ghost | Detects | Example | Fix suggestion |
|---|---|---|---|
| Specter of Vagueness | unmeasurable quality adjectives: fast, quick, easy, simple, user-friendly, intuitive, robust, scalable, seamless, efficient, flexible, modern, responsive (when not about layout), reliable, secure (bare), performant | "should load fast" | replace with a measurable target, e.g. `within 2 seconds at p95` |
| Poltergeist of Ambiguity | vague quantifiers & escape hatches: some, many, several, most, few, various, appropriate, adequate, as needed, as appropriate, if possible, etc., and/or, TBD, TBC, and so on | "notify some users etc." | name the exact set / remove escape hatch |
| Wraith of Weak Will | weak modals: should, may, might, could, would, ideally, preferably, try to | "should save" | `SHALL` |
| Faceless Ghoul | passive voice without an actor: (is/are/be/been/will be) + past participle with no "by ..." | "an email is sent" | name the actor: `THE SYSTEM SHALL send an email` |
| Banshee of Absolutes | untestable absolutes: always, never, all, every, 100%, instantly, immediately, zero downtime, any | "never fails" | bounded, testable limit |
| Wandering Soul | line that is a requirement but has no EARS shape (no SHALL, no WHEN/WHILE/IF/WHERE trigger) | "Users log in with email" | EARS template |
| Two-Headed Beast | compound requirement: more than one "shall"/"and shall", or two verbs joined by "and" after SHALL | "SHALL save and email the file" | split into two requirements |

Headings, blank lines, and `As a ..., I want ..., so that ...` user-story lines are recognized (user stories are not
"Wandering Souls"; instead they get an EARS acceptance-criterion suggestion).

## Haunt score
0 (purified) – 100 (fully cursed). Weighted by severity per requirement line, normalized by number of requirement lines,
monotonic: adding a finding never lowers the score; fixing (removing) a finding never raises it. Score bands:
0–10 "Purified", 11–35 "Restless", 36–65 "Haunted", 66–100 "Cursed".

## Exorcism (auto-fix)
- Deterministic rewrites where safe: weak modal → SHALL; "etc." / "and so on" removed; vague adjective → placeholder
  `‹measurable: e.g. within 2 s›`; passive → `THE SYSTEM SHALL <verb>` template; Wandering Soul → EARS template
  `WHEN <trigger>, THE SYSTEM SHALL <response>` wrapping the original text.
- Exorcise one ghost, or "Exorcise all" (with undo).
- Property: applying exorcise-all is idempotent (applying twice = once) and never increases the haunt score.

## EARS transmutation
"As a <role>, I want <goal>, so that <benefit>" → User Story + acceptance criteria stub
`WHEN <role> requests <goal>, THE SYSTEM SHALL <goal-as-response>`. Plain sentences → `THE SYSTEM SHALL ...`.

## Export
- Kiro spec format `requirements.md`: `# Requirements Document`, `## Introduction`, `## Requirements`, then
  `### Requirement N`, `**User Story:** ...`, `#### Acceptance Criteria` numbered EARS lines.
- Download file, copy to clipboard, and a share link that encodes the text in the URL hash (no server).
- Persist the current text in localStorage.

## UI / "costume"
- Night graveyard scene: each requirement line is a tombstone (engraved with its line number), ghosts (inline SVG, one
  distinct silhouette + color per ghost type) hover above the tombstone of the line they haunt, drifting gently.
- Left: the "grimoire" editor (textarea with line numbers + highlighted ghost words in an overlay).
- Top: haunt meter drawn as a moon that is blood-red when cursed and turns pale silver as you purify; numeric score
  + band label (live region).
- Clicking a ghost (or pressing Enter on it) opens the "exorcism card": ghost name, the cursed words highlighted, why
  it's a problem, the suggested rewrite (diff), buttons Exorcise / Ignore.
- Bestiary drawer listing all ghost types and counts (doubles as a legend).
- Sample "cursed scrolls" to load (e.g. a login feature, a checkout feature, a pumpkin-delivery app).
- Purified state: fog lifts, a small celebration (respecting reduced motion).
- Optional ambient drone toggle (Web Audio, off by default).
- Fonts: system fonts only (serif for headings e.g. Georgia/"Times New Roman", monospace for the editor).

## Out of scope
No accounts, no AI/LLM calls, no server, no analytics.
