# Requirements Document

## Introduction

Haunted Spec is a client-side requirements linter that detects vague, ambiguous, and untestable language in requirements documents. It provides one-click fixes and exports specifications in EARS notation and Kiro format. The tool is fully static (no backend), offline-capable, and accessible.

### Purpose
Enable developers, product managers, and students to write clear, testable requirements before implementation or handoff to AI coding agents.

### Scope
This document specifies the analyzer core, scoring algorithm, auto-fix transformations, CLI, UI components, accessibility, export formats, and deployment. All requirements use EARS notation or SHALL statements.

## Glossary

- **Ghost**: A type of requirements defect (vagueness, ambiguity, weak modals, etc.). Each ghost has a name, severity (1-3), detection pattern, and fix suggestion.
- **Finding**: A detected instance of a ghost in a specific line of text, with start/end positions and matched substring.
- **Haunt Score**: A numeric quality metric (0-100) derived from findings and requirement line count. 0 is purified, 100 is fully cursed.
- **Score Band**: A qualitative label for a score range: Purified (0-10), Restless (11-35), Haunted (36-65), Cursed (66-100).
- **Exorcism**: An auto-fix transformation that rewrites a finding to remove or replace the ghost.
- **EARS**: Easy Approach to Requirements Syntax. Format: `WHEN/WHILE/IF/WHERE <trigger>, THE <system> SHALL <response>`.
- **Requirement Line**: A line classified as a requirement (contains imperative language or is a numbered/bulleted statement, excluding headings and user stories).
- **User Story**: A line matching the pattern `As a <role>, I want <goal>, so that <benefit>`.
- **Monotonicity**: Property that adding findings never decreases the haunt score, and removing findings never increases it.
- **Idempotency**: Property that applying an operation twice produces the same result as applying it once.

## Requirements

### Requirement 1: Analyzer Core

**User Story:** As a developer, I want a pure, deterministic analyzer that detects all seven ghost types in requirements text, so that I can test it in Node.js without browser dependencies.

#### Acceptance Criteria

1.1. WHEN the analyzer receives a text string as input, THE analyzer SHALL tokenize the text into lines and classify each line as heading, blank, user story, or requirement line.

1.2. WHEN the analyzer processes a requirement line, THE analyzer SHALL apply all seven ghost detection rules to that line and collect findings.

1.3. WHEN a ghost detection rule matches a substring in a requirement line, THE analyzer SHALL record a finding with ghostId, line index, start position, end position, matched text, severity, message, and suggestion.

1.4. WHEN the analyzer completes processing, THE analyzer SHALL return a report containing the array of lines (with classifications), array of findings, haunt score, and score band label.

1.5. WHEN the analyzer is invoked with identical text twice, THE analyzer SHALL produce identical findings and scores both times.

1.6. WHEN the analyzer runs in a Node.js environment, THE analyzer SHALL complete without calling any browser-specific APIs.

### Requirement 2: Ghost Detection Rules

**User Story:** As a user, I want the tool to detect seven specific types of requirements defects, so that I can fix them before implementation.

#### Acceptance Criteria

2.1. WHEN a requirement line contains an unmeasurable quality adjective ("fast", "quick", "easy", "simple", "user-friendly", "intuitive", "robust", "scalable", "seamless", "efficient", "flexible", "modern", "responsive", "reliable", "secure", "performant"), THE analyzer SHALL create a finding with ghostId "specter-of-vagueness" and severity 2.

2.2. WHEN a requirement line contains a vague quantifier or escape hatch ("some", "many", "several", "most", "few", "various", "appropriate", "adequate", "as needed", "as appropriate", "if possible", "etc.", "and/or", "TBD", "TBC", "and so on"), THE analyzer SHALL create a finding with ghostId "poltergeist-of-ambiguity" and severity 2.

2.3. WHEN a requirement line contains a weak modal verb ("should", "may", "might", "could", "would", "ideally", "preferably", "try to"), THE analyzer SHALL create a finding with ghostId "wraith-of-weak-will" and severity 3.

2.4. WHEN a requirement line contains passive voice without an actor (a form of "to be" followed by a past participle with no "by" clause specifying an agent), THE analyzer SHALL create a finding with ghostId "faceless-ghoul" and severity 2.

2.5. WHEN a requirement line contains an untestable absolute term ("always", "never", "all", "every", "100%", "instantly", "immediately", "zero downtime", "any"), THE analyzer SHALL create a finding with ghostId "banshee-of-absolutes" and severity 3.

2.6. WHEN a requirement line is classified as a requirement line AND does not contain the word "SHALL" AND does not start with an EARS trigger word (WHEN, WHILE, IF, WHERE), THE analyzer SHALL create a finding with ghostId "wandering-soul" and severity 1.

2.7. WHEN a requirement line contains more than one occurrence of "SHALL" OR contains "and shall" OR contains two imperative verbs joined by "and" after a single "SHALL", THE analyzer SHALL create a finding with ghostId "two-headed-beast" and severity 3.

2.8. WHEN a line is classified as a heading or blank line or user story, THE analyzer SHALL NOT apply ghost detection rules to that line.

### Requirement 3: Haunt Score

**User Story:** As a user, I want a numeric quality score that reflects the number and severity of defects in my requirements, so that I can track improvement as I fix issues.

#### Acceptance Criteria

3.1. WHEN the analyzer calculates the haunt score, THE analyzer SHALL compute a weighted sum of findings by severity (severity 1: weight 1, severity 2: weight 2, severity 3: weight 3).

3.2. WHEN the weighted sum is computed, THE analyzer SHALL normalize it by dividing by the number of requirement lines (lines classified as requirement lines, excluding headings, blank lines, and user stories), producing a per-line defect density.

3.3. WHEN the per-line defect density is computed, THE analyzer SHALL scale it to the range 0-100, capping at 100.

3.4. WHEN the text contains zero requirement lines, THE analyzer SHALL return a haunt score of 0.

3.5. WHEN the haunt score is in the range 0-10, THE analyzer SHALL assign the band label "Purified".

3.6. WHEN the haunt score is in the range 11-35, THE analyzer SHALL assign the band label "Restless".

3.7. WHEN the haunt score is in the range 36-65, THE analyzer SHALL assign the band label "Haunted".

3.8. WHEN the haunt score is in the range 66-100, THE analyzer SHALL assign the band label "Cursed".

### Requirement 4: Score Monotonicity

**User Story:** As a user, I want the haunt score to increase only when defects are added and decrease only when defects are removed, so that I can trust the score as a quality metric.

#### Acceptance Criteria

4.1. WHEN a finding is removed from a text (by exorcism or manual edit), THE analyzer SHALL produce a haunt score less than or equal to the score before removal.

4.2. WHEN a finding is added to a text (by introducing a ghost pattern), THE analyzer SHALL produce a haunt score greater than or equal to the score before addition.

4.3. WHEN a text is modified in a way that does not add or remove findings (e.g., changing non-ghost words), THE analyzer SHALL produce the same haunt score as before the modification.

### Requirement 5: Exorcism

**User Story:** As a user, I want to apply a one-click fix to a detected defect, so that I can rewrite vague or ambiguous requirements into clear, testable statements within one interaction.

#### Acceptance Criteria

5.1. WHEN the user requests exorcism of a "wraith-of-weak-will" finding, THE system SHALL replace the weak modal verb ("should", "may", "might", "could", "would", "ideally", "preferably", "try to") with the word "SHALL".

5.2. WHEN the user requests exorcism of a "poltergeist-of-ambiguity" finding containing "etc." or "and so on", THE system SHALL remove the phrase.

5.3. WHEN the user requests exorcism of a "specter-of-vagueness" finding, THE system SHALL replace the vague adjective with a placeholder of the form `‹measurable: e.g., <example>›` where `<example>` is a context-appropriate measurable target.

5.4. WHEN the user requests exorcism of a "faceless-ghoul" finding (passive voice), THE system SHALL rewrite the sentence to include an explicit actor using the template "THE SYSTEM SHALL <verb> <object>".

5.5. WHEN the user requests exorcism of a "wandering-soul" finding, THE system SHALL wrap the original requirement text in an EARS template: "WHEN <trigger>, THE SYSTEM SHALL <original text>".

5.6. WHEN the user requests exorcism of a "banshee-of-absolutes" finding, THE system SHALL replace the absolute term with a placeholder of the form `‹bounded: e.g., <example>›` where `<example>` is a context-appropriate bounded constraint.

5.7. WHEN the user requests exorcism of a "two-headed-beast" finding, THE system SHALL split the compound requirement into two separate requirement sentences, each containing a single "SHALL".

5.8. WHEN an exorcism is applied to a finding, THE system SHALL return the modified text with the finding's matched substring replaced or rewritten according to the ghost-specific transformation.

5.9. WHEN an exorcism is applied, THE resulting text SHALL contain no more findings of that ghost type at that position.

### Requirement 6: Exorcise All

**User Story:** As a user, I want to apply all available fixes at once, so that I can purify a heavily haunted spec in one operation.

#### Acceptance Criteria

6.1. WHEN the user requests "exorcise all", THE system SHALL apply the exorcism transformation to every finding in the current text, in order from last to first by position, to avoid offset corruption.

6.2. WHEN "exorcise all" completes, THE system SHALL return the fully transformed text.

6.3. WHEN "exorcise all" is applied to a text, THE resulting haunt score SHALL be less than or equal to the score before the operation.

### Requirement 7: Exorcism Idempotency

**User Story:** As a user, I want exorcism operations to be idempotent, so that applying the same fix twice does not corrupt the text.

#### Acceptance Criteria

7.1. WHEN "exorcise all" is applied to a text T, producing text T', AND "exorcise all" is applied again to T', THE result SHALL be identical to T'.

7.2. WHEN a single exorcism is applied to a finding F in text T, producing text T', AND the analyzer is run on T', THE analyzer SHALL NOT produce a finding of the same ghost type at the same position.

### Requirement 8: EARS Transmutation

**User Story:** As a user, I want to convert user stories and plain requirements into EARS notation, so that my spec is consistent and testable.

#### Acceptance Criteria

8.1. WHEN the user requests EARS transmutation of a user story line matching "As a <role>, I want <goal>, so that <benefit>", THE system SHALL generate a user story heading followed by an acceptance criterion in the form "WHEN <role> requests <goal>, THE SYSTEM SHALL <goal-as-response>".

8.2. WHEN the user requests EARS transmutation of a plain requirement sentence (not a user story, not already in EARS form), THE system SHALL wrap it in the template "THE SYSTEM SHALL <original sentence>".

8.3. WHEN a line is already in EARS form (contains "SHALL" and optionally starts with "WHEN/WHILE/IF/WHERE"), THE system SHALL leave it unchanged.

### Requirement 9: Kiro Requirements Export

**User Story:** As a user, I want to export my purified requirements in Kiro spec format, so that I can use them directly in Kiro-driven development.

#### Acceptance Criteria

9.1. WHEN the user requests Kiro export, THE system SHALL generate a markdown document with the structure: `# Requirements Document`, `## Introduction`, `## Glossary`, `## Requirements`.

9.2. WHEN generating the Requirements section, THE system SHALL group consecutive requirement lines under a heading of the form `### Requirement N: <inferred-title>`, where N is a sequential integer and `<inferred-title>` is computed by extracting at least two words of the requirement.

9.3. WHEN a requirement group contains a user story, THE system SHALL output `**User Story:** As a ..., I want ..., so that ...` followed by `#### Acceptance Criteria` and a numbered list of EARS statements.

9.4. WHEN a requirement group contains plain EARS statements, THE system SHALL output them as a numbered list under `#### Acceptance Criteria`.

9.5. WHEN the Kiro export is complete, THE system SHALL present the generated markdown in a text area.

9.6. WHEN the Kiro export is complete, THE system SHALL enable downloading of the generated markdown.

### Requirement 10: Export and Share

**User Story:** As a user, I want to download, copy, or share my requirements document, so that I can use it in other tools or send it to teammates.

#### Acceptance Criteria

10.1. WHEN the user clicks the "Download" button, THE system SHALL trigger a file download with the filename `requirements.md` and the content of the current or exported text.

10.2. WHEN the user clicks the "Copy to Clipboard" button, THE system SHALL copy the current or exported text to the system clipboard.

10.3. WHEN the user clicks the "Share Link" button, THE system SHALL encode the current text in the URL fragment (hash).

10.4. WHEN the page is loaded with a URL fragment containing encoded text, THE system SHALL update the browser URL.

10.6. WHEN the user clicks the "Copy Link" button, THE system SHALL copy the share URL (with encoded text in the fragment) to the clipboard.

### Requirement 11: Persistence

**User Story:** As a user, I want my work to be saved automatically, so that I do not lose my requirements if I close the browser.

#### Acceptance Criteria

11.1. WHEN the editor text changes, THE system SHALL store the current text in localStorage under the key "haunted-spec-text".

11.2. WHEN the page loads, THE system SHALL retrieve the stored text from localStorage and populate the editor, unless a share URL fragment is present.

11.3. WHEN no stored text exists and no share URL is present, THE system SHALL populate the editor with a default sample or empty text.

### Requirement 12: Graveyard UI

**User Story:** As a user, I want to see each requirement line represented as a tombstone with ghosts hovering above defects, so that I can visually identify problems at a glance.

#### Acceptance Criteria

12.1. WHEN the analyzer produces a report, THE system SHALL render one tombstone SVG element per requirement line, engraved with the line number.

12.2. WHEN a finding exists for a line, THE system SHALL render a ghost SVG element above that line's tombstone, using the color and silhouette defined for that ghost type.

12.3. WHEN multiple findings exist on the same line, THE system SHALL render all corresponding ghosts above that line's tombstone, horizontally offset to avoid overlap.

12.4. WHEN the user hovers over a ghost, THE system SHALL display a tooltip with the ghost name and matched text.

12.5. WHEN the user clicks or presses Enter on a ghost, THE system SHALL open the exorcism card for that finding.

12.6. WHEN the haunt score is 0 (Purified), THE system SHALL remove all ghost elements from the graveyard and lift the fog effect.

12.7. WHEN `prefers-reduced-motion: reduce` is active, THE system SHALL disable drifting and floating animations for ghosts and fog.

### Requirement 13: Grimoire Editor

**User Story:** As a user, I want a text editor with line numbers and in-line highlighting of ghost words, so that I can see exactly where defects are as I type.

#### Acceptance Criteria

13.1. WHEN the editor is rendered, THE system SHALL display a textarea with line numbers in a gutter to the left.

13.2. WHEN the editor text changes, THE system SHALL re-run the analyzer.

13.2a. WHEN the analyzer completes, THE system SHALL update the overlay highlighting.

13.3. WHEN a finding exists, THE system SHALL complete highlighting within 200 milliseconds of the editor text change.

13.4. WHEN a finding exists, THE system SHALL highlight the matched substring in the overlay using the ghost's assigned color and a subtle underline or background.

13.6. WHEN the editor is focused, THE system SHALL ensure the textarea has visible focus indication (2px solid border or outline).

**User Story:** As a user, I want a visual indicator of my spec's quality score, so that I can see my progress toward purification.

#### Acceptance Criteria

14.1. WHEN the analyzer produces a haunt score, THE system SHALL render a moon graphic that transitions in color from blood-red (score 100) through orange, yellow, to pale silver (score 0).

14.2. WHEN the haunt score changes, THE system SHALL update the moon color.

14.3. WHEN the haunt score changes, THE system SHALL display the numeric score and band label (Purified, Restless, Haunted, Cursed).

14.5. WHEN the score reaches 0 (Purified), THE system SHALL trigger a subtle celebration effect (respecting `prefers-reduced-motion`).

**User Story:** As a user, I want to see the details of a defect and apply or ignore the suggested fix, so that I have control over automated changes.

#### Acceptance Criteria

15.1. WHEN the exorcism card opens for a finding, THE system SHALL display the ghost name, the full line of text with the matched substring highlighted, the reason message, and the suggested rewrite.

15.2. WHEN the user clicks "Exorcise", THE system SHALL apply the exorcism transformation to the editor text.

15.3. WHEN the user clicks "Exorcise", THE system SHALL close the card.

15.3a. WHEN the card closes, THE system SHALL update the analysis.

15.4. WHEN the user clicks "Ignore", THE system SHALL close the card without modifying the text.

15.5. WHEN the exorcism card is open, THE system SHALL trap keyboard focus within the card.

15.6. WHEN the user presses Escape while the card is open, THE system SHALL close the card.

15.7. WHEN the exorcism card is rendered, THE system SHALL use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the ghost name heading.

15.8. WHEN focus is on the Exorcise or Ignore button, THE user SHALL be able to press Tab to cycle to the close button.

### Requirement 16: Bestiary

**User Story:** As a user, I want to see a list of all ghost types and their current counts, so that I can identify which defects occur with the highest frequency in my spec.

#### Acceptance Criteria

16.1. WHEN the bestiary drawer is opened, THE system SHALL display all seven ghost types with their name, color swatch, description, and current count.

16.2. WHEN no findings of a ghost type exist, THE system SHALL display that ghost with a count of 0.

16.3. WHEN the user clicks a ghost entry in the bestiary, THE system SHALL filter the graveyard view to show only findings of that ghost type.

16.4. WHEN the bestiary is rendered, THE system SHALL use `role="region"` and `aria-label="Ghost Bestiary"`.

### Requirement 17: Sample Cursed Scrolls

**User Story:** As a user, I want to load example requirements that are intentionally defective, so that I can explore the tool's capabilities without writing my own text.

#### Acceptance Criteria

17.1. WHEN the user opens the samples menu, THE system SHALL display a list of at least three sample requirements documents (e.g., login feature, checkout feature, pumpkin delivery app).

17.2. WHEN the user selects a sample, THE system SHALL load that sample text into the editor and re-run the analysis.

17.3. WHEN a sample is loaded, THE system SHALL preserve the previous editor text in an undo/restore mechanism (e.g., localStorage backup with a timestamp).

### Requirement 18: Accessibility - Keyboard

**User Story:** As a keyboard user, I want to navigate and operate all features without a mouse, so that the tool is fully accessible.

#### Acceptance Criteria

18.1. WHEN the user presses Tab, THE system SHALL move focus through all interactive elements in a logical order: editor, haunt meter, graveyard ghosts, bestiary toggle, export buttons, sample menu.

18.2. WHEN focus is on a ghost in the graveyard, THE user SHALL be able to press Enter or Space to open the exorcism card.

18.3. WHEN focus is on an interactive element, THE system SHALL display a visible focus indicator with at least 2px solid border or outline and a contrast ratio of at least 3:1 against the background.

18.4. WHEN a modal (exorcism card) is open, THE system SHALL trap focus within the modal.

18.5. WHEN the user dismisses the modal (exorcism card), THE system SHALL restore focus to the previously focused element.

### Requirement 19: Accessibility - ARIA and Live Regions

**User Story:** As a screen reader user, I want announcements of score changes and exorcism results, so that I can track progress without visual feedback.

#### Acceptance Criteria

19.1. WHEN the haunt score changes, THE system SHALL update an ARIA live region with `aria-live="polite"` containing the text "Haunt score: <score>, <band>".

19.2. WHEN an exorcism is successfully applied, THE system SHALL announce "Ghost exorcised. Haunt score now <score>." in the live region.

19.3. WHEN the graveyard is rendered, each ghost SHALL have `role="button"`, `tabindex="0"`, and `aria-label` describing the ghost type, line number, and matched text.

19.4. WHEN the exorcism card is rendered, THE system SHALL use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the ghost name.

19.5. WHEN the bestiary is rendered, THE system SHALL use `role="region"` and `aria-label="Ghost Bestiary"`.

### Requirement 20: Accessibility - Contrast

**User Story:** As a user with low vision, I want all text to meet WCAG AA contrast requirements, so that I can read the interface comfortably.

#### Acceptance Criteria

20.1. WHEN text is rendered on the dark graveyard background (hex `#1a1a2e`), THE text color SHALL have a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold).

20.2. WHEN ghost colors are rendered on the graveyard background, THE ghost silhouettes SHALL have a contrast ratio of at least 3:1.

20.3. WHEN the editor is rendered, the text color (white hex `#ffffff`) on the editor background (hex `#2d2d44`) SHALL have a contrast ratio of at least 4.5:1.

20.4. WHEN focus indicators are rendered, THE focus ring color SHALL have a contrast ratio of at least 3:1 against both the element background and the page background.

### Requirement 21: Accessibility - Reduced Motion

**User Story:** As a user sensitive to motion, I want animations to be disabled when I enable reduced motion in my OS settings, so that I can use the tool comfortably.

#### Acceptance Criteria

21.1. WHEN the user's OS or browser is set to `prefers-reduced-motion: reduce`, THE system SHALL disable all drifting and floating animations for ghosts.

21.2. WHEN reduced motion is active, THE system SHALL disable fog and mist effects.

21.3. WHEN reduced motion is active, THE system SHALL use instant transitions instead of fade-in or fade-out effects.

21.4. WHEN reduced motion is active, THE purification celebration SHALL be static (no animated confetti or particles).

21.5. WHEN reduced motion is active, THE core functionality (detection, exorcism, export) SHALL remain unchanged.

### Requirement 22: CLI

**User Story:** As a developer, I want a command-line tool that lints a markdown file and exits with an error code if the haunt score exceeds a threshold, so that I can integrate the linter into CI or pre-commit hooks.

#### Acceptance Criteria

22.1. WHEN the CLI is invoked with `node bin/haunt.mjs <file.md>`, THE CLI SHALL read the file and run the analyzer.

22.2. WHEN the analyzer completes, THE CLI SHALL print the haunt score and band.

22.3. WHEN the CLI is invoked with `node bin/haunt.mjs <file.md> --max <threshold>`, THE CLI SHALL exit with code 0 if the haunt score is less than or equal to `<threshold>`, and exit with code 1 otherwise.

22.4. WHEN the CLI encounters a file read error, THE CLI SHALL print an error message to stderr and exit with code 2.

22.5. WHEN the CLI is invoked with `--help` or `-h`, THE CLI SHALL print usage instructions and exit with code 0.

22.6. WHEN the CLI is invoked with `--json` flag, THE CLI SHALL output the full analysis report as JSON to stdout.

### Requirement 23: Offline and Static Deployment

**User Story:** As a user, I want the tool to work offline without any network calls, so that I can use it in restricted environments or offline settings.

#### Acceptance Criteria

23.1. WHEN the HTML page is loaded, THE system SHALL load all scripts, styles, and assets from relative paths (no CDN or external URLs).

23.2. WHEN the page is served from GitHub Pages under a sub-path (e.g., `/haunted-spec/`), THE system SHALL correctly resolve all relative paths.

23.3. WHEN the page is opened from the filesystem (`file://` protocol), THE system SHALL function successfully (ES modules permitting browser support).

23.4. WHEN the application is running, THE system SHALL NOT make any network requests (no fetch, no XHR, no external images or fonts).

23.5. WHEN localStorage is unavailable (e.g., private browsing), THE system SHALL degrade gracefully, disabling persistence but leaving all other features functional.

### Requirement 24: No Copyrighted Assets

**User Story:** As a contributor, I want all graphics and audio to be generated in this repository, so that the project is freely distributable and hackathon-compliant.

#### Acceptance Criteria

24.1. WHEN the page is rendered, all ghost silhouettes and UI graphics SHALL be inline SVG or CSS-generated shapes defined in the project's style files.

24.2. WHEN ambient sound is enabled, THE system SHALL synthesize audio using the Web Audio API (no external audio files).

24.3. WHEN fonts are rendered, THE system SHALL use system fonts only (Georgia, "Times New Roman", monospace, sans-serif) with no web fonts or external font files.

24.4. WHEN the repository is audited, there SHALL be no image files, audio files, or font files from external sources or stock libraries.
