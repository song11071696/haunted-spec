---
inclusion: always
---

# Spooky UX

## Tone of Voice
**Playful-gothic, but always clear about the actual problem and fix.**

- Use spooky metaphors (ghosts, haunting, exorcism, graveyard, cursed, purified) for the theme
- Error messages and fix suggestions must be plain, technical, and actionable
- Example: "The **Specter of Vagueness** haunts this line" is fine for the UI, but the message should say: "Replace 'fast' with a measurable target, e.g., 'within 2 seconds at p95'."
- Never sacrifice clarity for cuteness
- The costume serves the function: every spooky element is a functional UI component

## Ghost Roster

Each ghost has a distinct color and silhouette for quick recognition.

| Ghost | Color | Silhouette |
|---|---|---|
| **Specter of Vagueness** | `#9B59B6` (purple) | Wispy, flowing robes |
| **Poltergeist of Ambiguity** | `#E67E22` (orange) | Jagged, chaotic shape |
| **Wraith of Weak Will** | `#3498DB` (blue) | Fading, translucent figure |
| **Faceless Ghoul** | `#95A5A6` (gray) | Featureless oval head, hunched |
| **Banshee of Absolutes** | `#E74C3C` (red) | Screaming mouth, wild hair |
| **Wandering Soul** | `#1ABC9C` (teal) | Simple orb with trailing wisp |
| **Two-Headed Beast** | `#F39C12` (amber) | Two heads on one body |

## Accessibility Rules

### Keyboard
- All interactive elements (ghosts, buttons, drawers, samples) must be keyboard-operable
- Tab order is logical: editor → meter → graveyard ghosts → bestiary → export
- Focus visible at all times (custom focus ring, 2px solid, high contrast)
- Ghost selection: Tab to ghost, Enter/Space to open exorcism card
- Exorcism card: Esc to close, Tab to cycle through Exorcise/Ignore buttons

### Live Regions
- Haunt score and band changes announced via `aria-live="polite"` region
- Format: "Haunt score: 42, Haunted" or "Haunt score: 0, Purified"
- Exorcism success: "Ghost exorcised. Haunt score now 38."

### Reduced Motion
- Respect `prefers-reduced-motion: reduce`
- When reduced motion is on:
  - No drifting/floating ghost animations
  - No fog/mist effects
  - Instant transitions instead of fades
  - Purification celebration is static (no confetti/particles)
- Core functionality is unchanged

### Contrast
- WCAG AA contrast (4.5:1 for normal text, 3:1 for large text)
- Ghost colors on dark graveyard background: test against `#1a1a2e` (dark blue-gray)
- Editor text: white on dark (`#ffffff` on `#2d2d44`)
- Focus indicators: high-contrast border or outline
- Haunt meter labels: readable at all score levels

### ARIA
- Graveyard ghosts: `role="button"`, `aria-label="Specter of Vagueness on line 3: 'fast'"`, `tabindex="0"`
- Bestiary: `role="region"`, `aria-label="Ghost Bestiary"`
- Exorcism card: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="<ghost-name-id>"`
- Haunt meter: `role="status"`, `aria-live="polite"`
- Editor: `role="textbox"`, `aria-multiline="true"`, `aria-label="Requirements editor"`

## "The Costume Must Serve the Function" Principle

Every visual element is functional:
- **Ghosts** are not decoration; they are lint findings. Clicking a ghost opens its fix.
- **Graveyard tombstones** are line markers. Their position corresponds to line numbers.
- **Haunt meter (moon)** is not ambiance; it's the quality score. The color band is the severity indicator.
- **Fog/mist** lifts when purified, signaling completion.
- **Bestiary** is not lore; it's the legend and finding counts.
- **Exorcism card** is the fix UI, not a narrative device.

No decorative ghosts. No fake tombstones. Every element maps to data or function.
