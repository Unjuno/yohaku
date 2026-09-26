// Read-only release smoke test against an explicitly supplied deployment.
// Run from a full checkout with dependencies installed. Does not run an LLM.
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { compileSources } from "../tests/load-source.mjs";

const args=process.argv.slice(2);
if(args.length!==2 || args[0]!=="--url"){
  console.error("Usage: node scripts/check-public-beta.mjs --url https://your-deployment.example");
  process.exit(2);
}
const url=new URL(args[1]);
if(url.username || url.password || (url.protocol!=="https:" && !(url.protocol==="http:" && ["127.0.0.1","localhost"].includes(url.hostname)))){
  throw new Error("Use an HTTPS deployment URL or a loopback HTTP preview, without credentials");
}
const c=compileSources(fileURLToPath(new URL("../",import.meta.url)),[
  "lib/config.ts","lib/discovery.ts","lib/story-contract.ts","lib/stories.ts",
  "lib/additional-seeds.ts","lib/experience-gap-seeds.ts","lib/field-seeds.ts",
]);
const report={target:url.origin,checked_at:new Date().toISOString(),result:"NOT_RUN",checks:[],not_tested:["real_browser","Remote_MCP_transport","LLM_play","human_appeal"]};
async function get(path){
  const response=await fetch(new URL(path,url.origin),{headers:{accept:"application/json"},cache:"no-store",signal:AbortSignal.timeout(10000)});
  assert.equal(response.status,200,`GET ${path}: HTTP ${response.status}`);
  assert.ok(response.headers.get("content-type")?.includes("application/json"),`GET ${path}: not JSON`);
  return response.json();
}
try{
  const {PLAY_STORIES,listStories,searchStories,getStory}=await c.import("lib/stories.ts");
  const {GM_GUIDE,FALLBACK_CATALOG_LIMIT}=await c.import("lib/config.ts");
  const catalog=await get("/api/stories");
  assert.equal(catalog.catalog_mode,"selection_only");
  assert.equal(catalog.count,PLAY_STORIES.length);
  const project=story=>Object.fromEntries(Object.entries(story).filter(([key])=>key!=="story_url"));
  assert.deepEqual(catalog.stories.map(project),listStories());
  report.checks.push({name:"catalog_matches_checkout",result:"PASS",count:catalog.count});
  for(const row of catalog.stories){
    const expected=new URL(`/api/stories/${encodeURIComponent(row.id)}`,url.origin);
    const returned=new URL(row.story_url);
    assert.equal(returned.origin,url.origin,"story_url points outside this deployment");
    assert.equal(returned.pathname,expected.pathname);
    const detail=await get(expected.pathname);
    for(const key of ["id","title","world","initial_state","gm_guide"]){
      assert.equal(detail[key],getStory(row.id)[key],`${row.id}: ${key} differs from checkout`);
    }
  }
  report.checks.push({name:"all_story_bodies_and_guide_match",result:"PASS",count:catalog.count});
  for(const query of ["今日は変なのがいい","笑いたい","怖くないSF","落ち着きたい","誰かと話したい","何か作りたい","怖い話がいい","コメディは嫌い","zzzz"]){
    const result=await get(`/api/stories?${new URLSearchParams({query,limit:"20"})}`);
    assert.deepEqual(result.stories.map(project),searchStories({query,limit:20}),query);
  }
  const fallback=await get("/api/compat/stories");
  assert.equal(fallback.count,FALLBACK_CATALOG_LIMIT);assert.equal(fallback.total_available,PLAY_STORIES.length);
  assert.equal(fallback.gm_guide,GM_GUIDE);
  assert.ok(fallback.stories.every(story=>!Object.hasOwn(story,"gm_guide")));
  report.checks.push({name:"discovery_and_bounded_fallback",result:"PASS"});
  const home=await fetch(new URL("/",url.origin),{cache:"no-store",signal:AbortSignal.timeout(10000)});
  assert.equal(home.status,200,"home page inaccessible");const html=await home.text();
  assert.ok(html.includes("開始メッセージをコピー"),"new primary CTA is not present in server-rendered HTML");
  assert.ok(html.includes("template=play-report.yml")&&html.includes("template=seed.yml"),"community entry links missing");
  report.checks.push({name:"rendered_entrance_and_community_links",result:"PASS"});
  report.result="PASS";
}catch(error){
  const unreachable=error?.name==="TimeoutError" || error?.name==="AbortError" ||
    (error instanceof TypeError && /fetch failed/i.test(error.message));
  report.result=unreachable?"UNCERTAIN":"FAIL";
  report.error=String(error?.message??error);
  if(error?.cause?.code) report.network_error=error.cause.code;
  process.exitCode=1;
}finally{c.clean();console.log(JSON.stringify(report,null,2));}
