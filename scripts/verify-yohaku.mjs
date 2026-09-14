import assert from "node:assert/strict";
import worker from "../dist/server/index.js";

const request = (path, init) => worker.fetch(new Request(`https://yohaku.local${path}`, init));
const addedIds = [
  "memory-city", "dragon-pass", "bandit-pass", "ruin-vault", "dragon-fort", "missing-gem",
  "abandoned-hospital", "unmapped-planet", "drifting-rescue", "snow-survival", "masked-ball", "shinobi-rescue",
];
const playIds = ["moon-diner", "clockwork-rescue", "room-falling", "last-post", ...addedIds];
const initialInstruction = /してもいい|選べる|急がなくていい|あなたが決められる|決めてもいい|確認できる/;
const forbiddenSeedDetail = /犯人は|共犯|隠し場所|唯一の正解|攻略|成功手順|固定エンディング|進行の都合|変更しない|事前に決めない|弱点表/;
const readRpc = async (response) => {
  const raw = await response.text();
  const line = raw.split("\n").filter((item) => item.startsWith("data: ")).at(-1);
  return JSON.parse(line ? line.slice(6) : raw);
};

const catalog = await request("/api/stories");
assert.equal(catalog.status, 200);
const catalogBody = await catalog.json();
assert.equal(catalogBody.catalog_mode, "selection_only");
assert.deepEqual(catalogBody.stories.map((story) => story.id), playIds);
assert.equal(catalogBody.count, 16);
for (const story of catalogBody.stories) {
  assert.ok(story.id && story.title && story.selection_hint && story.summary && Array.isArray(story.tags));
  assert.ok(!Object.hasOwn(story, "world") && !Object.hasOwn(story, "initial_state") && !Object.hasOwn(story, "gm_guide"));
}

for (const param of ["query=zzzz", "q=zzzz"]) {
  const response = await request(`/api/stories?${param}`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).count, 0);
}
for (const param of ["limit=0", "limit=-1", "limit=NaN"]) {
  const response = await request(`/api/stories?${param}`);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "invalid_limit");
}

for (const id of playIds) {
  const response = await request(`/api/stories/${id}`);
  assert.equal(response.status, 200);
  const story = await response.json();
  assert.ok(story.world && story.initial_state && story.gm_guide);
  for (const heading of ["【Player Authority】", "【GM Authority】", "【Progressive Commitment】", "【No Player Worldbuilding Burden】", "【No Knowledge Quiz】", "【No Plot Recovery】", "【No Premature Revelation】"]) assert.ok(story.gm_guide.includes(heading));
  assert.ok(!initialInstruction.test(story.initial_state), `${id}: instructional phrase remains in live initial_state`);
}
for (const id of addedIds) {
  const response = await request(`/api/stories/${id}`);
  assert.equal(response.status, 200);
  const story = await response.json();
  assert.ok(story.world && story.initial_state && story.gm_guide);
}

const compat = await request("/api/compat/stories");
assert.equal(compat.status, 200);
const compatBody = await compat.json();
assert.equal(compatBody.count, 16);
assert.ok(compatBody.stories.every((story) => story.world && story.initial_state && story.gm_guide));

const mcp = async (id, method, params = {}) => {
  const response = await request("/api/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  assert.equal(response.status, 200);
  return readRpc(response);
};
const listed = await mcp(1, "tools/list");
assert.deepEqual(listed.result.tools.map((tool) => tool.name), ["search_stories", "get_story"]);
const none = await mcp(2, "tools/call", { name: "search_stories", arguments: { query: "zzzz" } });
assert.equal(none.result.structuredContent.count, 0);
const got = await mcp(3, "tools/call", { name: "get_story", arguments: { id: "last-post" } });
assert.ok(got.result.structuredContent.world && got.result.structuredContent.initial_state && got.result.structuredContent.gm_guide);
const mcpAll = await mcp(4, "tools/call", { name: "search_stories", arguments: { query: "", limit: 20 } });
assert.deepEqual(mcpAll.result.structuredContent.stories.map((story) => story.id), playIds);
for (const [query, expected] of [
  ["怖くないSF", "unmapped-planet"], ["探偵", "missing-gem"], ["ホラー", "abandoned-hospital"],
  ["潜入", "masked-ball"], ["救助", "clockwork-rescue"], ["静かな", "moon-diner"],
]) {
  const rest = await (await request(`/api/stories?query=${encodeURIComponent(query)}&limit=20`)).json();
  assert.ok(rest.stories.some((story) => story.id === expected), `${query}: REST search missed ${expected}`);
  const rpc = await mcp(10 + query.length, "tools/call", { name: "search_stories", arguments: { query, limit: 20 } });
  assert.deepEqual(rpc.result.structuredContent.stories.map((story) => story.id), rest.stories.map((story) => story.id));
}

const review = await request("/review/data.json");
assert.equal(review.status, 200);
const reviewBody = await review.json();
assert.equal(reviewBody.meta.read_only, true);
assert.deepEqual(reviewBody.current_play.map((story) => story.id), playIds);
assert.deepEqual(reviewBody.unadopted_candidates, []);
for (const story of [...reviewBody.current_play, ...reviewBody.unadopted_candidates]) {
  for (const key of ["id", "title", "summary", "selection_hint", "tags", "world", "initial_state", "review_note"]) assert.ok(Object.hasOwn(story, key));
}
for (const story of reviewBody.current_play) {
  assert.ok(!initialInstruction.test(story.initial_state), `${story.id}: instructional phrase remains in candidate initial_state`);
  assert.ok(!forbiddenSeedDetail.test(story.world), `${story.id}: hidden truth, walkthrough, or GM instruction remains in world`);
}
for (const forbidden of ["held_drafts", "new_candidates", "candidates", "scenario_checks", "gm_guides", "methodology", "representative_recommendations"]) assert.ok(!Object.hasOwn(reviewBody, forbidden));
assert.ok(reviewBody.gm_guide.text.includes("【Progressive Commitment】"));

for (const path of ["/api/stories", "/api/compat/stories", "/review/data.json"]) assert.equal((await request(path, { method: "POST" })).status, 405);

console.log(JSON.stringify({ play_count: playIds.length, catalog_selection_only: "PASS", all_story_details: "PASS", compatibility_count: compatBody.count, rest_mcp_search_parity: "PASS", gm_guide_progressive_commitment: "PASS", review_current_play: "PASS", read_only: "PASS" }, null, 2));
