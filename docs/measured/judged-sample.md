# Hand-judged findings

One rater, not blind. **Useful** = a reviewer would plausibly want this line flagged; **noise** = it should not have been flagged.
Excerpts are truncated quotes from the public files listed in `sources.txt` (sample A) and in the held-out list below.

## Sample A: 40 random findings from the 10 docs, engine v1.0 (seed 42)

| # | Rule | Matched | Verdict | Still reported after the v1.1 fix? |
|---|---|---|---|---|
| 0 | wandering-soul | especially on the controlling user agent which is  | noise | no |
| 1 | wandering-soul | to refer to the entire device and software respons | noise | no |
| 2 | faceless-ghoul | is found | useful | yes |
| 3 | wandering-soul | **Stakeholder:** Students (Item Finder), Lecturers | noise | no |
| 4 | wandering-soul | This System Requirements Document (SRD) defines th | noise | no |
| 5 | wandering-soul | when a protocol operation fails.  For example, if  | noise | no |
| 6 | wandering-soul | Specifications](device_specs.md) document for expe | noise | no |
| 7 | two-headed-beast | and log | useful | yes |
| 8 | wandering-soul | `ArrayBufferView` types in ECMAScript). | noise | no |
| 9 | specter-of-vagueness | robust | useful | yes |
| 10 | two-headed-beast | shall | useful | yes |
| 11 | wandering-soul | (or *controller*), which creates a [*receiving bro | noise | no |
| 12 | faceless-ghoul | is initiated | noise | yes |
| 13 | faceless-ghoul | is terminated | noise | yes |
| 14 | wandering-soul | **Notification**: Sending notifications upon proce | noise | no |
| 15 | wandering-soul | **Stakeholder:** All Users (Students, Lecturers, S | noise | no |
| 16 | wandering-soul | Show profile of hospitals | useful | yes |
| 17 | poltergeist-of-ambiguity | appropriate | useful | yes |
| 18 | wandering-soul | *receiver*, including browser, OS, networking and  | noise | no |
| 19 | two-headed-beast | SHALL | useful | yes |
| 20 | wandering-soul | Ensures data consistency across distributed servic | noise | yes |
| 21 | two-headed-beast | shall | useful | yes |
| 22 | wandering-soul | **Fault Injection**: Testing failure scenarios at  | noise | no |
| 23 | faceless-ghoul | being stored | noise | yes |
| 24 | poltergeist-of-ambiguity | appropriate | useful | yes |
| 25 | wandering-soul | **Stakeholder:** All Users, Campus Security | noise | no |
| 26 | wandering-soul | The [Remote Playback API](https://w3c.github.io/re | noise | yes |
| 27 | wraith-of-weak-will | should | useful | yes |
| 28 | wandering-soul | **Measurable Criteria:** Timed from the moment the | noise | no |
| 29 | wraith-of-weak-will | should | useful | yes |
| 30 | wandering-soul | **Saga Orchestration**: Coordinating the entire tr | noise | no |
| 31 | wandering-soul | **Measurable Criteria:** Measured via browser deve | noise | no |
| 32 | banshee-of-absolutes | instantly | useful | yes |
| 33 | wandering-soul | modest hardware requirements, similar to what is f | noise | no |
| 34 | wandering-soul | **Stakeholder:** Library Member, Librarian, System | noise | no |
| 35 | wandering-soul | This table below shows which functional requiremen | noise | yes |
| 36 | specter-of-vagueness | easily | useful | yes |
| 37 | faceless-ghoul | be notified | useful | yes |
| 38 | wandering-soul | presentation display connected to the same IPv4 or | noise | no |
| 39 | two-headed-beast | and display | noise | yes |

v1.0: 14/40 useful (35%). v1.1: 14/21 useful (67%); no useful finding in the sample was lost. The fix was tuned on this sample, so see sample B.

## Sample B (held out): 25 random findings, engine v1.1, from 6 docs not used for tuning (seed 7)

Docs: Team-Midterm/School-House-Talk requirements.md, Dungeons-Developers/DnD-React requirements.md, mretallack/SlimBook clean-feed, sushilldhakal/scheduler kairos, SuperagenticAI/specmem specdiff, darko-mesaros/shuk upload-only (Kiro specs).

| # | Rule | Matched | Verdict |
|---|---|---|---|
| 0 | poltergeist-of-ambiguity | many | noise |
| 1 | wandering-soul | add multiple events and sports | useful |
| 2 | wandering-soul | a campaign view that allows players to share a spa | useful |
| 3 | wraith-of-weak-will | attempt to | useful |
| 4 | specter-of-vagueness | real-time | useful |
| 5 | wandering-soul | inform student/parent teacher of event changes | useful |
| 6 | banshee-of-absolutes | immediately | useful |
| 7 | wandering-soul | act as a chat between students/teachers/coaches/ad | useful |
| 8 | wraith-of-weak-will | could | noise |
| 9 | specter-of-vagueness | real-time | useful |
| 10 | wandering-soul | Communicate school events to students/parents/teac | useful |
| 11 | specter-of-vagueness | simple | useful |
| 12 | wandering-soul | Non-functional requirements are requirements that  | noise |
| 13 | wraith-of-weak-will | should | noise |
| 14 | specter-of-vagueness | securely | useful |
| 15 | wandering-soul | A user can create, read, update, and delete charac | useful |
| 16 | wandering-soul | photo upload for character avatars | useful |
| 17 | wandering-soul | Show student athletes eligibility | useful |
| 18 | wandering-soul | test will be run to verify that students/teachers/ | noise |
| 19 | specter-of-vagueness | efficiently | useful |
| 20 | wandering-soul | Target Android API 26+ (Android 8.0+) | noise |
| 21 | wandering-soul | A user can create an account | useful |
| 22 | two-headed-beast | SHALL | useful |
| 23 | wandering-soul | No external dependencies beyond Android SDK | noise |
| 24 | wandering-soul | Users (students/teachers/parents) will subscribe t | useful |

v1.1 held out: 18/25 useful (72%).

Held-out doc URLs (pinned):

- https://github.com/Team-Midterm/School-House-Talk/blob/c4f0fff6355ee656426295266e0d0e7d44d34417/requirements.md
- https://github.com/Dungeons-Developers/DnD-React/blob/0b5ce7c2e9550cef42117685d1c7d16e0bedb0e6/requirements.md
- https://github.com/mretallack/SlimBook/blob/ffda6bc9857325c2f4146d02cf2d1ce7ef670184/.kiro/specs/clean-feed/requirements.md
- https://github.com/sushilldhakal/scheduler/blob/f7caefea6f18ba24e5f88d3b0728440e123cdf0e/.kiro/specs/kairos/requirements.md
- https://github.com/SuperagenticAI/specmem/blob/7879b89afb94c5955cfecd37ea27b88037ab2307/.kiro/specs/specdiff/requirements.md
- https://github.com/darko-mesaros/shuk/blob/d47805f508674ab83d7b6778b176fcaee2d2a2cf/.kiro/specs/upload-only/requirements.md
