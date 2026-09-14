# YOHAKU roadmap evaluation — 2026-09-12

## Environment and evidence classes

- Production HTTP: executed against `https://yohaku-trpg.unjuno.chatgpt.site` before and after the fix.
- Local deterministic contract tests: executed against the built Worker.
- Independent model conversations: 22 fresh agent contexts executed for the focused solution-prediction and GM regressions below. The runtime did not expose a model identifier or decoding parameters, so those fields are unknown.
- Voice tests: not executed.
- Human user tests: not executed.

The following A/B notes are editorial comparisons and frozen test candidates, not model or user outcomes.

## Selection A/B

- Hypothesis: offering contrasting activities reduces clarification without exposing implementation details.
- A: `今日はどんなものがいい？`
- B: `静かな交流、道具を使う冒険、少し緊張する話があります。どれが近い？ おまかせでも大丈夫。`
- Fixed conditions: the same four-story Catalog; no IDs, MCP terminology, or story details shown to the player.
- Planned synthetic runs: 3 user intents × 2 variants × 2 repetitions = 12 conversations.
- Executed model runs: 0. Editorial result: B states what can be done and gives an escape hatch; A is shorter but transfers all framing work to the user. No production change was made solely from this comparison.
- Failure gates: more than one unnecessary question; internal ID exposure; choosing a story inconsistent with the stated mood.

## Onboarding A/B

- Hypothesis: removing repeated examples shortens the prelude without hiding safety or player freedom.
- A: current production guide.
- B: `音声なら、安全で静かな場所で目を閉じるのがおすすめです。歩行中や運転中は目を閉じないでください。思ったことをそのまま話してください。迷ったら「今どうなってる？」「何ができる？」と聞けます。……では、始めます。`
- Fixed conditions: optional voice recommendation, driving/walking warning, free action, two recovery questions.
- Planned synthetic runs: 4 stories × 2 variants × 2 repetitions = 16 conversations.
- Executed model runs: 0. Editorial result: B is shorter and retains the explicit safety condition, but whether it reduces confusion requires model and human observation. Production guide remains unchanged.
- Failure gates: closing eyes framed as mandatory; fixed choices implied; repeated tutorial after the first player action.

## Initial-state A/B

- Hypothesis: removing instructional endings from the scene keeps immersion while the guide supplies freedom rules.
- A: current four initial states.
- B: same facts and order, with only sentences such as `どちらから扱うかは、あなたが決められる` removed when they duplicate the guide.
- Fixed conditions: role, place, immediate situation, perceivable tools/people, genre, and hidden facts.
- Planned synthetic runs: 4 stories × 2 variants × 2 repetitions = 16 conversations.
- Executed model runs: 0. Editorial result: Moon Diner, Clockwork Rescue, and Falling Room already avoid most manual-like endings. Last Post still has one duplicated freedom sentence; it remains unchanged until model comparison is available.
- Regression case: when asked how to sort the envelope, the GM must give the sorting principle and the visible address text, without asking the player to invent or recite unseen content.

## Static four-pole checks

Each story was checked for a role, an immediate situation, at least two perceivable affordances, and a non-player-owned world fact. These are document checks, not play simulations.

- Moon Diner: guest request, ingredients, heat/rain/sound, conversation and preparation affordances.
- Clockwork Rescue: injured machine animal, scout image, tools, map and routes.
- Falling Room: descent, maintenance panel, communicator, visible neighbor.
- Last Post: concrete address text, route map, delivery record, lookout and alternative mail.

## Human trial protocol

- Unit: one first-time participant receives one selection/onboarding variant and one story; do not replay the same mystery for the same participant.
- Primary observations: `want_again`, continuation in the same session, later return, and voluntary sharing.
- Secondary observations: time to first self-directed action, `何すればいい？`, abandonment, and choosing another story.
- Assignment: randomize A/B within each story and balance story/variant order across participants.
- Minimum pilot: 5 participants per cell for defect discovery only; do not perform significance claims.
- Stop immediately for: inaccessible information demanded from the player, unauthorized player action, contradictory facts, forced route, or safety wording failure.
- Record only consented, anonymized observations; YOHAKU itself must not collect play transcripts.

## Focused over-constraint A/B — snow / hospital / drifting rescue

Date: 2026-09-12. These are synthetic independent-model executions, not human or voice tests.

- World-only solution prediction: A 6 runs (3 stories × 2), B 6 runs, hospital B2 2 additional runs. Each run received only one world's `world` and produced one five-step prediction.
- GM regression: 6 fresh conversations (3 stories × 2), plus one snow and one rescue retest after a newly exposed missing fact was fixed. Each used the candidate `world + initial_state + gm_guide` and 4–6 sequential player turns.
- A snow: 2/2 converged on radio contact followed by long cabin waiting. Final B: 2/2 still began with communication/observation, but later policy branched among short waiting, local reconnaissance, rescue response, and east-route movement. Initial convergence fell from high to medium; ending convergence was low.
- A hospital: 2/2 converged on stopping/controlling recordings and withdrawing from the east wing. B1 still made recording relocation an obvious decoy in 2/2 and was rejected. Final B2 removed recording as a control mechanism; 2/2 instead used local warning signs and different access/help choices. Recording-control convergence fell from high to low.
- A rescue: 2/2 converged on using the tow point to suppress rotation before entering the starboard hatch. Final B: 2/2 still considered the tow point, but both identified rotation matching/direct approach as a rational alternative. Convergence fell from high to medium.
- Observed regression: one snow GM accepted a player-proposed rope that was not fixed in `world`; one rescue GM invented a standard aid pack only after the player proposed sending supplies. Both outcome-relevant ordinary resources were added to the candidate world and the same actions passed in fresh retests.
- No unresolved major failure was observed in the final eight GM conversations. Minor residual risk: snow's first action still often favors communication and short observation; hospital commonly favors quiet movement; rescue has only one intact hatch. These are rational starting biases, not guaranteed solutions.
- Frozen unchanged in this round: memory-city, dragon-pass, bandit-pass, ruin-vault, dragon-fort, missing-gem, unmapped-planet, masked-ball, shinobi-rescue.

## H / T / D / C / U

- H: after contract repair, all public selection interfaces expose exactly the same four works and separate selection metadata from story content.
- T: local Worker checks plus unauthenticated production HTTP/MCP checks on 2026-09-12.
- D: PASS only if counts, IDs, fields, aliases, invalid-limit responses, individual fetches, and MCP outputs match the contract.
- C: stale deployment, a second unfiltered data source, query alias drift, or fallback code reintroduces full story data into the standard Catalog.
- U: model identifier and decoding parameters were not exposed; the sample is small and synthetic. Voice and human sessions remain unexecuted, so perceived tension, freedom, clarity, and replay variety remain unverified.
