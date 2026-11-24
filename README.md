# 👻 Haunted Spec

**Exorcise the ghosts haunting your requirements.**

Haunted Spec is a spooky, 100% client-side requirements linter. Paste your requirements or user stories and the
*ghosts* hiding in them (vague adjectives, weak modals, untestable absolutes, faceless passive voice...) rise out of a
moonlit graveyard. Click a ghost to see why it haunts you and exorcise it with a one-click rewrite, then export a
Kiro-ready `requirements.md` in EARS notation.

**Live app:** https://song11071696.github.io/haunted-spec/ &nbsp;·&nbsp; **Kiroween 2026 category:** Costume Contest

> No account, no API key, no server, no AI calls. Your text never leaves your browser.

---

## Why

Vague requirements are the cheapest bug to fix and the most expensive one to ship. With AI coding agents a vague spec
turns into vague code even faster: *"The page should load fast and be user-friendly"* cannot be tested, so every
person (and every agent) builds something different.

Haunted Spec gives developers, PMs and students a fast, private way to see **what** is ambiguous and **how** to fix it
*before* a spec is handed to Kiro or any other agent.

## The costume is the function

| Spooky element | What it really is |
|---|---|
| A ghost floating over a tombstone | one lint finding on one requirement line |
| The moon (blood red → silver) | the haunt score, 0–100 |
| The exorcism card | the explanation + a before/after diff of the fix |
| "Exorcise all" | deterministic, idempotent auto-fix of every finding |
| The Bestiary | the rule legend, with live counts |
| Fog lifting at dawn | the spec reached **Purified** (score ≤ 10) |

## Ghost Bestiary

| Ghost | Haunts | Example | Exorcism |
|---|---|---|---|
| **Specter of Vagueness** | unmeasurable quality words | "load *fast*", "*user-friendly*" | `‹measurable: within 2 s at p95›` |
| **Poltergeist of Ambiguity** | vague quantifiers & escape hatches | "*some* users", "*etc.*", "*TBD*", "*and/or*" | removes the escape hatch or asks for the exact set |
| **Wraith of Weak Will** | weak modals | "*should* save" | `SHALL` |
| **Faceless Ghoul** | passive voice with no actor | "an email *is sent*" | `is sent by ‹actor›` |
| **Banshee of Absolutes** | untestable absolutes | "*never* fails", "*instantly*", "*100%*", "*all devices*" | `‹bounded: within 500 ms›` |
| **Wandering Soul** | a requirement with no EARS shape | "Users log in with email." | `THE SYSTEM SHALL ensure that users log in with email.` |
| **Two-Headed Beast** | two requirements fused into one | "SHALL charge the card *and email* the receipt" | split into two SHALL lines |

Quoted words (`"should"`), inline code and `‹placeholders›` are treated as *mentions* and never linted, so a fixed line
stays fixed and a spec can talk about the rules without tripping them. Introduction/Glossary sections are prose and are
skipped. User stories are judged on their words (vagueness, ambiguity, absolutes), not on EARS shape.

**Haunt score:** each requirement line contributes `min(sum of severities, 6)`; the score is that total over
`6 × requirement lines`, scaled to 0–100. Bands: 0–10 *Purified*, 11–35 *Restless*, 36–65 *Haunted*, 66–100 *Cursed*.

## Use it

- **Web:** open the live app, pick a *cursed scroll* (sample) or paste your own text.
  - Click a ghost (or Tab to it and press Enter) → exorcism card → **Exorcise** / **Leave it**.
  - Double-click a glowing word in the editor (or Alt+Enter) to summon its ghost.
  - **Exorcise all** fixes everything; **Undo** goes back (50 steps).
  - **Export** → download `requirements.md` (Kiro spec format), copy it, or copy a share link (the text lives in the URL hash, no server).
  - **Sound** is off by default; when on, a Web Audio drone and an exorcism chime are synthesized live (no audio files).
- **CLI** (same core, Node 18+):

```bash
node bin/haunt.mjs path/to/requirements.md            # list ghosts + score
node bin/haunt.mjs path/to/requirements.md --max 10   # exit 1 if score > 10 (usable as a CI gate)
node bin/haunt.mjs path/to/requirements.md --fix      # print the exorcised text
node bin/haunt.mjs path/to/requirements.md --kiro     # print a Kiro requirements.md
node bin/haunt.mjs path/to/requirements.md --json     # full report
```

- **Run locally:** `npm install && npm test`, then serve the folder (`npm run serve`) and open http://localhost:8080.

## How it is built

```
index.html, styles/main.css       static shell, gothic theme, reduced-motion + focus styles
src/core/   (pure, DOM-free)      tokenize → ghosts (rules + fixes) → score → analyze → exorcise → ears (EARS + Kiro export)
src/ui/     (browser modules)     editor, graveyard, ghost-art (7 inline SVG silhouettes), meter, card, bestiary, export, sound, samples, main
bin/haunt.mjs                     CLI on the same core
test/                             node:test unit tests + fast-check property-based tests
.kiro/                            specs, steering, hooks and the custom agent used to build this
.github/workflows/pages.yml       included workflow: test → dogfood gate → publish (not yet run, see below)
```

No framework, no bundler, no runtime dependencies. `fast-check` is the only dev dependency.

## Deployment

The live site is served by GitHub Pages from the `gh-pages` branch, which holds the static files (`index.html`,
`styles/`, `src/`). The workflow in `.github/workflows/pages.yml` (tests → dogfood gate → publish to `gh-pages`) is
included in the repo, but it has not run yet: the current `gh-pages` branch was published directly, and the tests and
the dogfood check were run locally (`npm test`, `node bin/haunt.mjs .kiro/specs/haunted-spec/requirements.md --max 10`).

---

## How Kiro was used

Everything in `.kiro/` is committed exactly as it was used. The project was built with **Kiro CLI 3.5** in headless
mode (`kiro-cli chat --no-interactive --agent exorcist ...`) on the free plan, so every step was designed to be
credit-frugal.

### 1. Brief → spec (spec-driven development)
`docs/brief.md` is the one-page product brief. Kiro (Claude Sonnet 4.5) turned it into a full spec in
`.kiro/specs/haunted-spec/`:

- **requirements.md** – 20+ requirements, each with a user story and numbered **EARS** acceptance criteria
  (`WHEN … THE Haunted_Spec SHALL …`), plus a glossary.
- **design.md** – architecture (pure core vs. UI), exact module interfaces, data models, the ghost rule table and
  numbered **Correctness Properties** ("For any text T, …") mapped back to requirements.
- **tasks.md** – a 30-group implementation plan ordered core → tests → CLI → UI → a11y → deployment, with
  property-test tasks called out.

The design's interfaces (`analyze(text) → {lines, findings, score, band}`, `exorcise`, `exorciseAll`, `toEars`,
`toKiroRequirements`) were kept as the contract for the whole build, which is what let the core and the UI be generated
in separate, cheap Kiro sessions without drifting apart.

### 2. Steering
`.kiro/steering/` holds five documents that ride along with every request:

- `product.md`, `tech.md`, `structure.md` – always included; they pin the hard constraints (static, no network,
  relative paths for the GitHub Pages sub-path, ES modules, no runtime deps) so Kiro never reached for a framework or a CDN.
- `spooky-ux.md` – the tone of voice ("playful-gothic but always clear about the real problem and fix"), the ghost
  roster with colours/silhouettes, and the rule that **the costume must serve the function**. This is what made the
  generated UI map every spooky element to a real feature instead of decoration.
- `testing.md` – `inclusion: fileMatch` on `test/**/*.mjs`, so the property-testing guidance only loads when Kiro is
  touching tests (saves context and credits).

**Biggest lesson:** steering + a precise design.md let us *remove* the spec files from the agent's always-loaded
resources. The first implementation run loaded every spec file on every turn (~165k characters per request) and burned
credits before writing a file; after trimming the agent to steering-only resources and pointing it at the exact section
of design.md it needed, requests dropped to roughly a third of that size.

### 3. Custom agent + CLI hooks
`.kiro/agents/exorcist.json` is a custom Kiro CLI agent used for all implementation runs:

- `resources`: the steering docs only; the spec is read on demand.
- `hooks.agentSpawn`: `git status --short` so the agent starts knowing what changed.
- `hooks.postToolUse` (matcher `write`): runs the test suite after **every file write** and feeds back only the
  pass/fail lines - a tight red/green loop without wasting tokens on full logs.
- `hooks.stop`: runs the suite once more and reports failures when the agent finishes.

### 4. IDE agent hooks
`.kiro/hooks/` holds four Kiro IDE hooks that automate the workflow for anyone opening the repo in Kiro:

| Hook | Trigger | What it automates |
|---|---|---|
| `test-on-core-change` | edit `src/core/**`, `test/**` | run `npm test`, fix failures without weakening tests |
| `exorcise-own-spec` | edit `.kiro/specs/**/*.md` | run **our own linter** on the spec and rewrite any haunted acceptance criteria |
| `bestiary-sync` | edit `src/core/ghosts.mjs` | keep the Bestiary table in this README in sync with the rules |
| `a11y-sweep` | manual | audit keyboard, focus, `aria-live` and reduced-motion handling |

### 5. Dogfooding: the spec is linted by the app it specifies
The `exorcise-own-spec` hook was run against Kiro's own `requirements.md`. Haunted Spec found the ghosts Kiro had
written into its own acceptance criteria (lines that listed "should/may/fast" unquoted, compound "and download"
criteria, a few "is rendered" passives: 19/100 on the first pass); Kiro then rewrote those lines until the linter
reported **0 ghosts, 0/100 Purified**.
The same check can be run by anyone (`node bin/haunt.mjs .kiro/specs/haunted-spec/requirements.md --max 10`), and it
is wired into the included GitHub Actions workflow as a gate, so the spec cannot silently become haunted again once
the workflow is enabled.

### 6. Property-based testing caught what unit tests missed
`test/properties.test.mjs` implements the design's correctness properties with fast-check (500 runs each):
determinism, score bounds, "findings point at real text", score monotonicity, **exorciseAll is idempotent**,
**exorciseAll never raises the score and leaves no ghosts**, "exorcising a finding removes it", and "the Kiro export
always has the required skeleton".

PBT found real bugs that every hand-written unit test passed:

- a zero-length regex match on an empty line sent the first core draft into an **infinite loop**;
- `"THE SHALL SHALL"` – a stuttering duplicate SHALL – made the Two-Headed Beast fix non-idempotent;
- `"shall may may THE"` showed that exorcising a duplicated weak modal could leave the same ghost at the same offset;
- numbered criteria like `19.2. WHEN …` were not recognised as list items, which made passive triggers look faceless.

### 7. Spec-driven vs. vibe coding
We tried both on purpose:

- **Vibe-style** (first core run, cheapest model, "implement groups 2–10"): fast, but the code invented its own ghost
  ids, re-scanned the whole line as one zero-length "Wandering Soul" match, and the tests were rewritten to fit the code.
- **Spec-driven** (UI run): because design.md fixed the interfaces and steering fixed the constraints, Kiro generated
  ~1,800 lines of UI (12 modules + CSS) in one session that plugged into the core with only small integration fixes
  (ghost ids, dialog centring, editor alignment).

The spec's correctness properties were the real win: they turned "does it work?" into executable checks, and they are
why we trust `Exorcise all`.

### Kiro features used
Kiro CLI (headless), spec-driven development (requirements/design/tasks), steering (always + fileMatch inclusion),
custom agent, CLI agent hooks (agentSpawn/postToolUse/stop), IDE agent hooks (fileEdited/userTriggered),
property-based testing, and model selection per task (Sonnet 4.5 for spec and UI, Haiku 4.5 for the dogfood pass, a
low-cost model for the first core draft).

### What was done outside Kiro
For transparency: the first Kiro-generated core draft was reviewed and largely rewritten outside Kiro while the
property tests were being made to pass (rule lists, masking of quotes/placeholders, idempotent fixes, the scoring
formula), and the Kiro-generated UI received a polish pass (wiring it to the real ghost ids, editor/gutter alignment,
dialog centring, samples that trigger every ghost). The GitHub Actions workflow, LICENSE and package.json were written
directly. Everything under `.kiro/` is Kiro output, kept as-is except for trimming the agent's resources and hook
commands to save credits.

---

## Accessibility
Keyboard-operable ghosts and dialogs (`<dialog>` with focus trapping, Esc to close), visible amber focus rings, score
changes announced through an `aria-live` region, `prefers-reduced-motion` disables drifting fog, bobbing ghosts and the
candle flicker, and text colours chosen for WCAG AA contrast on the night palette.

## License
[MIT](LICENSE) © 2026 song11071696. All artwork is inline SVG/CSS made for this project; all sound is synthesized at
runtime. No third-party assets.
