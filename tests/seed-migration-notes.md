# YOHAKU Seed migration — internal verification notes

Date: 2026-09-13 UTC

## Scope

- Candidate source: `lib/stories.ts`
- Common behavior: `lib/config.ts` (`GM_GUIDE`)
- Public review projection: `lib/review-data.ts`
- Current play set remains `moon-diner`, `clockwork-rescue`, `room-falling`, `last-post`.
- Candidate Seeds were not added to play.

## Editorial migration

Twelve unadopted candidates were reduced to `title`, `summary`, `selection_hint`, `tags`, `world`, and `initial_state` as the playable Seed source. Fixed culprit, incident timeline, hidden item location, monster response recipe, enemy ability table, full route state, rescue solution, guard layout, completed negotiation terms, fixed ending, and work-in-progress version instructions were removed. `dragon-pass` was added to the shared candidate source because it previously existed only in review material.

The public review now projects directly from the same story source. Old drafts, change history, detailed evaluations, scenario checks, internal truths, and prior guide variants are not serialized into the page or JSON.

## Static and route checks

- Build: PASS
- Lint: PASS
- Current play remains four: PASS
- Selection-only standard Catalog: PASS
- Candidate story IDs return 404 from play detail API: PASS
- MCP tool list and play-only get/search behavior: PASS
- Public review contains 4 current play entries and 12 unadopted Seeds: PASS
- Review POST is read-only 405: PASS
- Review HTML does not contain prior fixed-fact markers or hidden-gem location: PASS

## Model execution

Execution path: delegated ChatGPT text-model runs using only the current `world`, `initial_state`, and common `GM_GUIDE`. No external chat/completions API, model ID, temperature control, audio client, or real user was available. Each work had one six-step continuity run and one logically reset alternate start; these are 24 logical Seed runs across five delegated model contexts, not 24 isolated API sessions. `last-post` received one additional known-defect continuity regression.

Inputs covered: surroundings, written/object information, role knowledge, an unlisted action, later fact recall, and an early or unexpected solution. Alternate starts checked that unspecified details could differ while the work identity remained stable.

Observed across candidate runs:

- Unknown world information pushed back to player: 0 observed
- Player action/emotion decided by GM: 0 observed
- Previously stated fact changed inside a run: 0 observed
- Forced return to a fixed plot or single route: 0 observed
- Genre-breaking escalation: 0 observed
- Major failures: 0 observed

Known-defect regression (`last-post`): the envelope text, map, and past delivery record were supplied concretely by the GM and recalled consistently. The player was not asked to invent the address; no unique mandatory sorting procedure was added. PASS in the observed run.

## Publication status

On 2026-09-14, the twelve reviewed Seeds were approved for API/MCP play distribution. The play set now contains all sixteen stories. The standard REST Catalog remains selection-only; `get_story` and individual story routes return `world`, `initial_state`, and the common guide. MCP and REST search share the same story set and search function.

## Residual risks

- Small synthetic text sample; it does not prove future model behavior.
- Alternate starts were logically reset inside delegated contexts, not isolated API sessions.
- Long-session commitment beyond the tested turns is unverified.
- Real-time voice interruption, recognition errors, pacing, and actual user desire to continue are untested.
- Mystery coherence over a full improvised investigation remains the highest candidate-specific risk.
