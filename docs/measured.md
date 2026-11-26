# Measured on real specs

Haunted Spec was run on **10 public requirement documents from GitHub** (pinned to a commit, listed in
[`measured/sources.txt`](measured/sources.txt)): the first 5 hand-written `requirements.md` files returned by a GitHub
code search for "Functional Requirements" + "Non-Functional Requirements", and the first 5 English Kiro specs
(`.kiro/specs/*/requirements.md`) returned by a code search (one Chinese spec and one empty template were skipped).
Re-run it with `bash docs/measured/measure.sh`.

## Results (engine v1.1)

| Repo | File | Req. lines | v1.0 findings / score | v1.1 findings / score | Haunted lines (v1.1) |
|---|---|---|---|---|---|
| w3c/openscreenprotocol | `requirements.md` | 93 | 91 / 31 | 29 / 9 (Purified) | 27 |
| aws-samples/saga-orchestration-netcore-blog | `requirements.md` | 23 | 23 / 33 | 6 / 9 (Purified) | 6 |
| Skiet88/campus-lost-and-found | `REQUIREMENTS.md` | 94 | 61 / 17 | 37 / 8 (Purified) | 31 |
| ThatoMabilo/SmartLibraryManagementSystem | `REQUIREMENTS.md` | 62 | 62 / 28 | 48 / 21 (Restless) | 25 |
| eonum/geopitalsuisse | `requirements.md` | 22 | 26 / 39 | 22 / 33 (Restless) | 20 |
| crawlab-team/artipub | `.kiro/specs/ui-redesign/requirements.md` | 25 | 11 / 13 | 11 / 13 (Restless) | 10 |
| RankFTW/RHI | `.kiro/specs/ui-themes/requirements.md` | 24 | 6 / 8 | 6 / 8 (Purified) | 6 |
| sebsto/wispr | `.kiro/specs/cli-tool/requirements.md` | 54 | 15 / 7 | 15 / 7 (Purified) | 13 |
| soc221b/zod-schema-faker | `.kiro/specs/v4-file/requirements.md` | 33 | 12 / 12 | 9 / 9 (Purified) | 9 |
| chara-codes/chara | `.kiro/specs/dark-theme/requirements.md` | 33 | 6 / 6 | 6 / 6 (Purified) | 6 |
| **Total** | | **463** | **313** | **189** | **153 (33%)** |

- Hand-written docs: 109 of 294 requirement lines flagged (37%), mean score 16.
- Kiro-generated specs: 44 of 169 lines flagged (26%), mean score 8.6. Kiro's EARS format already removes most
  "should"/shape problems; what is left is mostly words: *appropriate*, *gracefully*, *real-time*, *immediately*,
  passive voice with no actor, and two actions in one criterion.
- v1.1 findings by rule: Faceless Ghoul 63, Wandering Soul 28, Two-Headed Beast 25, Wraith 22, Specter 20,
  Poltergeist 18, Banshee 13.

## How often is a finding useful?

We hand-judged random findings ([`measured/judged-sample.md`](measured/judged-sample.md); one rater, not blind):

| | Useful findings |
|---|---|
| v1.0, 40 random findings from the 10 docs | 14 / 40 (35%) |
| v1.1, same 40 (the fix was tuned on these) | 14 / 21 reported (67%), no useful finding lost |
| v1.1, **held out**: 25 random findings from 6 other public docs | **18 / 25 (72%)** |

v1.0's biggest problem was the EARS-shape rule (Wandering Soul): it fired on hard-wrapped prose, metadata lines such as
`**Stakeholder:** ...` and multi-sentence descriptions (1 useful out of 23 in the sample). v1.1 skips the shape rule on
those lines (word rules still run there), which removed 124 of 313 findings. By rule in the two judged samples, word
rules (vague, ambiguous, weak, absolute) were useful 14/17 times, Two-Headed Beast 5/6, Wandering Soul 11/18, and the
passive-voice rule only 2/5: it is the noisiest rule left.

## What we have not measured

Whether fixing the findings changes what a coding agent builds. We prepared that experiment (a vague and a cleaned
spec for the same small module, plus 15 hidden acceptance tests) but did not run it, so we make no claim about it.
