import assert from "node:assert/strict";
import { test, after } from "node:test";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { compileSources } from "./load-source.mjs";
import { readHostingBindings } from "../scripts/hosting-bindings.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const compiled = compileSources(root, [
  "lib/config.ts", "lib/additional-seeds.ts", "lib/story-contract.ts", "lib/stories.ts", "lib/story-http.ts", "lib/webmcp.ts",
  "app/api/stories/route.ts", "app/api/compat/stories/route.ts",
]);
after(compiled.clean);
const { STORIES, PLAY_STORIES, listStories, searchStories, getStory, getFallbackCatalogStories } = await compiled.import("lib/stories.ts");
const { ADDITIONAL_SEEDS } = await compiled.import("lib/additional-seeds.ts");
const { GM_GUIDE, FALLBACK_CATALOG_LIMIT } = await compiled.import("lib/config.ts");
const { parseSearchParams, SEARCH_INPUT_SCHEMA, MAX_SEARCH_LIMIT } = await compiled.import("lib/story-contract.ts");
const { createWebTools, startWebMcp } = await compiled.import("lib/webmcp.ts");
const catalogRoute = await compiled.import("app/api/stories/route.ts");
const compatRoute = await compiled.import("app/api/compat/stories/route.ts");
const request = (query="") => new Request(`https://yohaku.test/api/stories${query}`);
const rowKeys = ["id", "selection_hint", "summary", "tags", "title"].sort();
const tick = () => new Promise(resolve => setImmediate(resolve));
const canonical = value => JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a],[b]) => a.localeCompare(b))));

test("32 unique IDs, 16 additional Seeds, original 16 content unchanged", () => {
  assert.equal(STORIES.length, 32); assert.equal(PLAY_STORIES.length, 32); assert.equal(ADDITIONAL_SEEDS.length, 16);
  assert.equal(new Set(STORIES.map(s=>s.id)).size, 32); assert.equal(new Set(STORIES.map(s=>s.title)).size,32);
  const old = JSON.parse(readFileSync(new URL("./fixtures/original-seed-hashes.json", import.meta.url), "utf8"));
  for (const [id, hash] of Object.entries(old)) {
    assert.equal(createHash("sha256").update(canonical(STORIES.find(s=>s.id===id))).digest("hex"), hash, id);
  }
});
for (const seed of ADDITIONAL_SEEDS) test(`Seed shape and discovery: ${seed.id}`, () => {
  assert.deepEqual(Object.keys(seed).sort(), ["id","title","summary","selection_hint","tags","atmosphere","world","initial_state"].sort());
  for (const field of ["title","summary","selection_hint","world","initial_state"]) assert.ok(seed[field].trim());
  assert.ok(!/犯人は|隠し場所|固定エンディング|攻略手順|唯一の正解|進行の都合|事前に決めない/.test(seed.world));
  assert.ok(!/してもいい|あなたが決められる|急がなくていい/.test(seed.initial_state));
  assert.equal(searchStories({ query:seed.title })[0].id,seed.id);
  assert.equal(getStory(seed.id).initial_state,seed.initial_state);
});
test("full Catalog returns 32, even though search has a 20-result cap", async () => {
  const response = catalogRoute.GET(request()); assert.equal(response.status,200);
  const data = await response.json(); assert.equal(data.catalog_mode,"selection_only"); assert.equal(data.count,32);
  for (const row of data.stories) {
    assert.deepEqual(Object.keys(row).filter(k=>k!=="story_url").sort(),rowKeys);
    assert.ok(row.story_url.endsWith(`/api/stories/${row.id}`));
  }
  assert.equal(listStories().length,32); assert.equal(searchStories().length,3);
  assert.equal(searchStories({limit:20}).length,20);
  assert.equal((await catalogRoute.GET(request("?limit=20")).json()).count,20);
});
for (const raw of ["0","-1","NaN","21","32","1.5","","abc","Infinity","1e1"])
  test(`invalid explicit limit ${JSON.stringify(raw)} is 400, never silently clamped`,async()=>{
    const response=catalogRoute.GET(request(`?limit=${encodeURIComponent(raw)}`));
    assert.equal(response.status,400); assert.equal((await response.json()).error,"invalid_limit");
  });
test("query alias, no-match and selection_hint search",async()=>{
  for(const name of ["q","query"]) assert.equal((await catalogRoute.GET(request(`?${name}=zzzz`)).json()).count,0);
  assert.ok(searchStories({query:"静かな",limit:20}).some(s=>s.id==="moon-diner"));
  assert.deepEqual(parseSearchParams(new URLSearchParams("q=音楽")),parseSearchParams(new URLSearchParams("query=音楽")));
});
test("all tags and exclude tags retain shared behavior",()=>{
  const result=searchStories({query:"",tags:["SF"],exclude_tags:["救助"],limit:20});
  assert.ok(result.length); assert.ok(result.every(s=>s.tags.includes("SF")&&!s.tags.includes("救助")));
});
test("one-fetch default is bounded; common guide appears once",async()=>{
  const data=await compatRoute.GET(request()).json();
  assert.equal(data.count,FALLBACK_CATALOG_LIMIT); assert.equal(data.total_available,32);
  assert.equal(data.selection_scope,"recommended_subset"); assert.equal(data.gm_guide,GM_GUIDE);
  assert.ok(data.stories.some(s=>s.id==="unmapped-planet")); assert.ok(data.stories.some(s=>s.id==="rain-orchestra"));
  for(const s of data.stories) assert.ok(s.world&&s.initial_state&&!Object.hasOwn(s,"gm_guide"));
  assert.equal((JSON.stringify(data).match(/"gm_guide":/g)||[]).length,1);
  assert.equal(getFallbackCatalogStories({query:"zzzz"}).length,0);
  assert.equal((await compatRoute.GET(request("?query=ダンス")).json()).stories[0].id,"gravity-dance");
});
test("read-only routes",()=>{for(const route of [catalogRoute,compatRoute]) assert.equal(route.POST().status,405);});

const routeFetch = async (url) => {
  const value=new URL(url,"https://yohaku.test");
  if(value.pathname==="/api/stories") return catalogRoute.GET(new Request(value));
  const story=getStory(decodeURIComponent(value.pathname.split("/").at(-1)));
  return Response.json(story??{error:"story_not_found"},{status:story?200:404});
};
test("WebMCP preserves selection_hint/count and matches REST and shared MCP core",async()=>{
  const [tool]=createWebTools(routeFetch);
  assert.equal(tool.inputSchema.properties.limit.maximum,MAX_SEARCH_LIMIT);
  assert.ok(!tool.inputSchema.required?.includes("query"));
  for(const query of ["","静かな","怖くないSF","探偵","ホラー","潜入","音楽","ダンス","園芸","ラジオ","zzzz"]){
    const result=await tool.execute({query,limit:20});
    const rest=await catalogRoute.GET(request(`?query=${encodeURIComponent(query)}&limit=20`)).json();
    assert.deepEqual(result,{stories:searchStories({query,limit:20}),count:rest.count});
    assert.deepEqual(result.stories.map(s=>s.id),rest.stories.map(s=>s.id));
    result.stories.forEach(row=>assert.deepEqual(Object.keys(row).sort(),rowKeys));
  }
});
test("WebMCP gets every one of the 32 stories",async()=>{
  const [,tool]=createWebTools(routeFetch);
  for(const story of STORIES) assert.deepEqual(await tool.execute({id:story.id}),getStory(story.id));
});
for(const status of [400,404,500]) test(`WebMCP HTTP ${status} is an error, not empty results`,async()=>{
  const tools=createWebTools(async()=>Response.json({error:"upstream_error"},{status}));
  for(const tool of tools) await assert.rejects(()=>tool.execute({id:"last-post",query:"SF"}),e=>e.code==="http_error"&&e.status===status);
});
test("network failure remains a failure",async()=>{
  const [tool]=createWebTools(async()=>{throw new TypeError("offline")});
  await assert.rejects(()=>tool.execute({query:""}),e=>e.code==="network_error");
});
for(const body of [{error:"unexpected"},{stories:[],count:1},{stories:[{id:"x"}],count:1}])
  test(`reject malformed result ${JSON.stringify(body)}`,async()=>{
    const [tool]=createWebTools(async()=>Response.json(body));
    await assert.rejects(()=>tool.execute({}),e=>e.code==="invalid_response");
  });
test("invalid JSON and wrong story identity are rejected",async()=>{
  await assert.rejects(()=>createWebTools(async()=>new Response("oops"))[0].execute({}),e=>e.code==="invalid_response");
  await assert.rejects(()=>createWebTools(async()=>Response.json(getStory("last-post")))[1].execute({id:"moon-diner"}),e=>e.code==="invalid_response");
});
test("legitimate empty search and malformed input are different",async()=>{
  assert.deepEqual(await createWebTools(routeFetch)[0].execute({query:"zzzz"}),{stories:[],count:0});
  await assert.rejects(()=>createWebTools(routeFetch)[0].execute({query:3}),e=>e.code==="invalid_input");
  await assert.rejects(()=>createWebTools(routeFetch)[0].execute({limit:0}),e=>e.code==="invalid_limit");
});
test("faulty Catalog cannot leak a world through WebMCP projection",async()=>{
  const row={...searchStories({})[0],world:"not for search",gm_guide:"not for search"};
  const result=await createWebTools(async()=>Response.json({stories:[row],count:1}))[0].execute({});
  assert.deepEqual(Object.keys(result.stories[0]).sort(),rowKeys);
});
test("ready only after both registration promises resolve",async()=>{
  const states=[], pending=[], signals=[];
  const stop=startWebMcp({registerTool:(_tool,options)=>{signals.push(options.signal);return new Promise(resolve=>pending.push(resolve));}},s=>states.push(s),routeFetch);
  assert.deepEqual(states,[]); pending.shift()(); await tick(); assert.deepEqual(states,[]);
  pending.shift()(); await tick(); assert.deepEqual(states,["ready"]);
  stop(); assert.ok(signals.every(s=>s.aborted));
});
test("async registration failure rolls back partial registration",async()=>{
  const states=[],signals=[];let calls=0;
  startWebMcp({registerTool:(_t,o)=>{signals.push(o.signal);return ++calls===1?Promise.resolve():Promise.reject(new Error("rejected"));}},s=>states.push(s),routeFetch);
  await tick(); assert.deepEqual(states,["unavailable"]); assert.ok(signals.every(s=>s.aborted));
});
test("synchronous error is unavailable",async()=>{
  const states=[];startWebMcp({registerTool:()=>{throw new Error("duplicate")}},s=>states.push(s),routeFetch);
  await tick();assert.deepEqual(states,["unavailable"]);
});
test("unmount during registration does not register the second tool or report ready",async()=>{
  let resolve;let calls=0;const states=[];
  const stop=startWebMcp({registerTool:()=>{calls++;return new Promise(r=>{resolve=r;});}},s=>states.push(s),routeFetch);
  stop();resolve();await tick();assert.equal(calls,1);assert.deepEqual(states,[]);
});
test("legacy synchronous registration return value is also accepted",async()=>{
  const states=[];const stop=startWebMcp({registerTool:()=>{}},s=>states.push(s),routeFetch);
  await tick();assert.deepEqual(states,["ready"]);stop();
});
test("API absence is unavailable without throwing",async()=>{
  const states=[];startWebMcp(undefined,s=>states.push(s));await tick();assert.deepEqual(states,["unavailable"]);
});
test("execution signal is forwarded to fetch",async()=>{
  const controller=new AbortController();let signal;
  const [tool]=createWebTools(async(_url,init)=>{signal=init.signal;return Response.json({stories:[],count:0});});
  await tool.execute({}, {signal:controller.signal});assert.equal(signal,controller.signal);
});
test("hosting config is optional, invalid files are not silently ignored",()=>{
  const dir=mkdtempSync(`${tmpdir()}/yohaku-hosting-`),file=`${dir}/hosting.json`;
  try {
    assert.deepEqual(readHostingBindings(file),{});
    writeFileSync(file,JSON.stringify({project_id:"must-not-propagate",d1:"DB",r2:"BUCKET"}));
    assert.deepEqual(readHostingBindings(file),{d1:"DB",r2:"BUCKET"});
    writeFileSync(file,"not json");assert.throws(()=>readHostingBindings(file));
    writeFileSync(file,'{"d1":true}');assert.throws(()=>readHostingBindings(file));
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test("MCP source uses the same search/detail functions and limit constants",()=>{
  const source=readFileSync(new URL("../app/mcp/route.ts",import.meta.url),"utf8");
  assert.ok(source.includes('from "@/lib/stories"'));assert.ok(source.includes("searchStories(input)"));
  assert.ok(source.includes("max(MAX_SEARCH_LIMIT).default(DEFAULT_SEARCH_LIMIT)"));
  assert.equal(SEARCH_INPUT_SCHEMA.properties.limit.default,3);
});
