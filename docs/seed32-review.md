# 32 Seeds / agent transport changes

Base: `2060c89fe774cb78cbaf65ba326dd459873967ca`.

## Policy

Keep the original sixteen story objects byte-for-byte in their source declarations. Add sixteen Seeds, each containing only selection metadata, world premises and the current opening situation. Do not pre-author culprits, enemy stat tables, endings, solved negotiations or walkthroughs. A concrete object, relationship or world law is not a forbidden spoiler. The common guide, not each story, defines GM behavior.

A user can create a performance or choose an outfit *as their character*. That is different from requiring them to invent a letter they have not read. Observation must still return concrete GM-supplied information. Test prose checks are editing smoke tests, not proofs of immersion or content quality.

## Added Seeds: editorial differentiation, not measured preference

| ID | Main activity | Distinction from nearby Seeds |
|---|---|---|
| rain-orchestra | Play together and listen | Rain responds to an ensemble; not solving a weather emergency. |
| borrowed-spring | Cultivate | Seasonal care over time, not finding a planet's best base site. |
| carriage-commons | Build a shared place | Adapt living space with residents, not rescue or escort a train. |
| wind-regatta | Race and steer | Sports rivalry, not lethal survival or dragon combat. |
| shadow-wardrobe | Try a self-presentation | Player is the wearer, not a craftsperson satisfying a hidden correct order. |
| midnight-airwaves | Host a live program | Choose what to broadcast to listeners, not deliver a mysterious letter. |
| unwritten-stage | Perform with a partner | In-world theatrical creation, not an out-of-world setting questionnaire. |
| promise-market | Exchange and value | Local voluntary exchanges, not a single correct multi-party passage deal. |
| summer-reunion | Reconnect | Contemporary adult relationships; no forced romance, conspiracy or crisis. |
| tidal-embassy | Learn and translate | Test mutual understanding; no prewritten treaty to solve. |
| pocket-borough | Inhabit and traverse scale | Everyday miniature vertical urban space, not a treasure dungeon. |
| scent-archive | Collect and curate | Decide what a community preserves, not deduce a suspect from clues. |
| robot-holiday | Choose leisure | A free ordinary day, not a defective machine to repair. |
| dragon-nursery | Care and bond | Ongoing companionship, not treating an injured mechanical animal. |
| moonlight-photographer | Frame and photograph | Choose a viewpoint that records sound; not reconstruct a lost past. |
| gravity-dance | Coordinate movement | An embodied duet, not public negotiation or stage dialogue. |

Shared genres and verbs remain. The distinctions above are editorial judgments; they do not establish that every player perceives all 32 as distinct or attractive.

## Interface contracts

- `GET /api/stories` without `limit`: the complete selection-only list, currently 32. This is intentionally different from an agent's shortlist operation.
- With explicit `limit`: 1–20 integer. Invalid inputs return 400, never silently clamped.
- `search_stories`: default 3, maximum 20 through Remote MCP and WebMCP. Same query/tags/exclusions and selection fields.
- `get_story`: all 32 IDs remain directly retrievable; no 20-ID cap.
- `/api/compat/stories`: default 6 representative full Seeds. Explicit filtered queries use the same search. `gm_guide` moved to the top level, once. This is a response-format change: the handoff message and tests are updated together. `selection_scope`, `total_available`, and `catalog_url` make the subset explicit. Existing saved external handoff prompts may need refreshing.
- WebMCP assumes the September 2026 draft's `document.modelContext`, Promise-returning registration and AbortSignal lifetime. A synchronous return is tolerated, but no obsolete navigator API or nonstandard unregister API is assumed. Reference: https://webmachinelearning.github.io/webmcp/
- HTTP/network/JSON failures are errors, not empty searches. No model-context tools are claimed ready before both registrations finish.

## Local verification performed

Environment: Linux, Node 22.16.0, available TypeScript 5.8.3. Repository-pinned TypeScript remains 5.9.3; no dependency versions were upgraded. Package installation was attempted but did not complete in the local network environment.

- `node --test tests/source.test.mjs`: 53 tests passed, 0 failed at the first completed run.
- Strict type check of the changed dependency-free library modules: passed.
- The test compiler executes the actual repository modules after TypeScript transpilation and module-path resolution; HTTP routes are called as functions with synthetic Requests. It does not boot the complete Worker or an actual browser.
- Original sixteen story objects match stored SHA-256 fingerprints. The reconstructed baseline `lib/stories.ts` Git blob was verified as `8c258bd1d11685393ce84bed02d9ea4ceb83941c` before patching.
- Real browser registration, clipboard/share, full installed application build, live Remote MCP, GPT Live, long-session story consistency and human appeal: not tested here.

`npm test` runs source tests. `npm run test:types` checks the changed pure modules. `npm run check:sync` checks tracked paths; it is not a full secret scan. `npm run verify` builds and runs Worker REST/MCP integration checks. The Actions workflow runs source checks only, never deploys.

## Synchronization / deployment

Do not overwrite `.openai/hosting.json` in a Sites checkout. It remains ignored and is rejected by the tracked-path check. Standalone builds without that file use no D1/R2 bindings; this is suitable for the current file-backed Seeds, not a replacement for a future database configuration. Malformed local configs still fail rather than silently dropping bindings.

GitHub content-API writes do not automatically honor `.gitignore`: inspect the proposed sync paths before writing. Check additions, updates and removals against the correct source revision. No source-synchronization tool or deployment pipeline was added. No Sites production action is part of this branch.

## Remaining validation

H: new Seeds invite different first actions while the GM supplies unknown world information without taking over the player.
T: actual fresh text/voice sessions for added Seeds, followed by fact recall and one unlisted action. Not executed in this change.
D: a reported observation becoming a user-authored world fact, an unexplained contradiction, or forced plot recovery is a failure. No observed failure in a small sample is not a guarantee.
C: different labels could mask similar service interactions; a model might over-explain or turn a peaceful Seed into a crisis.
U: author preference, model/context differences, voice errors, long-session drift. Human appeal and repeat-play remain unknown; no synthetic percentage or numeric uncertainty was invented.
