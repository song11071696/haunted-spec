---
inclusion: always
---

# Product

## Purpose
Haunted Spec is a client-side requirements linter that surfaces vague, ambiguous, and untestable language in requirements documents and offers one-click fixes. It helps developers, PMs, and students write clear, testable specs before handing them to AI coding agents or teammates.

## Audience
- Developers writing Kiro specs or other requirements
- Product managers drafting user stories
- Students learning requirements engineering

## Problem
Vague requirements ("the page should load fast and be user-friendly") are the #1 source of rework. With AI coding agents, a vague spec becomes vague code even faster. Teams need a quick, free, private tool that shows *what* is ambiguous and *how* to fix it.

## Category
**Kiroween 2026 — Costume Contest**: the haunting UI is not decoration, it IS the function. Every ghost is a lint finding, the haunt meter is the quality score, exorcism is the fix. The costume serves the function.

## Success Criteria
- Correctly identifies all seven ghost types in requirements text
- Haunt score is monotonic (adding findings never lowers score, removing findings never raises it)
- Exorcise-all is idempotent (applying twice = applying once)
- One-click exorcism produces valid EARS notation
- Exports valid Kiro `requirements.md` format
- 100% offline and private (no network calls)
- Keyboard accessible, AA contrast, respects reduced-motion
- Dogfooding: our own spec passes our own linter
