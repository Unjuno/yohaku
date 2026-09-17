import assert from "node:assert/strict";
import worker from "../dist/server/index.js";

// Built Worker integration. Does not test a real WebMCP browser or LLM play.
const request = (path, init) => worker.fetch(new Request(`https://yohaku.local${path}`, init));
const catalog = await request("/api/stories");
assert.equal(catalog.status, 200);
const body = await catalog.json();
assert.equal(body.catalog_mode, "selection_only");
assert.ok(Number.isInteger(body.count) && body.count > 0);
const ids = body.stories.map(s=>s.id);
assert.equal(ids.length, body.count);
assert.equal(new Set(ids).size, body.count);
for (const row of body.stories) {
  assert.ok(row.id && row.title && row.summary && row.selection_hint && Array.isArray(row.tags));
  for (const key of ["world", "initial_state", "gm_guide"]) assert.ok(!Object.hasOwn(row,key));
  const detail = await request(`/api/stories/${row.id}`);
  assert.equal(detail.status, 200);
  const story = await detail.json();
  assert.ok(story.world && story.initial_state && story.gm_guide.includes("【Progressive Commitment】"));
}
for (const query of ["query=zzzz", "q=zzzz"]) assert.equal((await (await request(`/api/stories?${query}`)).json()).count,0);
for (const limit of [0,-1,21,body.count,"NaN"]) {
  const response = await request(`/api/stories?limit=${limit}`);
  assert.equal(response.status,400);assert.equal((await response.json()).error,"invalid_limit");
}
const compat = await (await request("/api/compat/stories")).json();
assert.equal(compat.selection_scope,"recommended_subset");assert.equal(compat.total_available,body.count);
assert.equal(compat.count,6);assert.ok(compat.gm_guide);
for(const story of compat.stories) assert.ok(story.world&&story.initial_state&&!Object.hasOwn(story,"gm_guide"));

const rpc = async (id,method,params={}) => {
  const response=await request("/api/mcp",{method:"POST",headers:{"content-type":"application/json",accept:"application/json, text/event-stream"},body:JSON.stringify({jsonrpc:"2.0",id,method,params})});
  assert.equal(response.status,200);
  const raw=await response.text(),line=raw.split("\n").filter(s=>s.startsWith("data: ")).at(-1);
  const value=JSON.parse(line?line.slice(6):raw);assert.ok(!value.error,JSON.stringify(value.error));return value;
};
const tools=await rpc(1,"tools/list");assert.deepEqual(tools.result.tools.map(t=>t.name),["search_stories","get_story"]);
for(const query of ["","静かな","怖くないSF","探偵","ホラー","潜入","音楽","園芸","町づくり","ダンス","コメディ","恋愛","教育","調停","経営","共生","別れ","報道","保育","農業","物流","科学","儀礼","zzzz"]){
  const rest=await(await request(`/api/stories?query=${encodeURIComponent(query)}&limit=20`)).json();
  const mcp=await rpc(2,"tools/call",{name:"search_stories",arguments:{query,limit:20}});
  assert.deepEqual(mcp.result.structuredContent.stories.map(s=>s.id),rest.stories.map(s=>s.id));
  for(const row of mcp.result.structuredContent.stories)assert.ok(row.selection_hint&&!Object.hasOwn(row,"world"));
}
for(const id of ids){
  const result=await rpc(3,"tools/call",{name:"get_story",arguments:{id}});
  assert.equal(result.result.structuredContent.id,id);assert.ok(result.result.structuredContent.initial_state);
}
const review=await(await request("/review/data.json")).json();
assert.deepEqual(review.current_play.map(s=>s.id),ids);assert.deepEqual(review.unadopted_candidates,[]);
for(const key of ["held_drafts","scenario_checks","gm_guides","methodology"])assert.ok(!Object.hasOwn(review,key));
for(const path of ["/api/stories","/api/compat/stories","/review/data.json"])assert.equal((await request(path,{method:"POST"})).status,405);
console.log(JSON.stringify({play_count:body.count,compat_count:compat.count,worker_rest_mcp:"PASS",review_projection:"PASS",browser_voice_llm:"NOT_TESTED"},null,2));