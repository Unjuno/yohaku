import assert from "node:assert/strict";
import { test, after } from "node:test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { compileSources } from "./load-source.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const c = compileSources(root, [
  "lib/config.ts", "lib/discovery.ts", "lib/entrance.ts", "lib/story-contract.ts",
  "lib/stories.ts", "lib/additional-seeds.ts", "lib/experience-gap-seeds.ts", "lib/field-seeds.ts",
  "lib/story-http.ts", "lib/webmcp.ts", "app/api/stories/route.ts", "app/api/compat/stories/route.ts",
]);
after(c.clean);
const { STORIES, PLAY_STORIES, searchStories, listStories, getStory } = await c.import("lib/stories.ts");
const { INTRO_STORY_IDS, resolveDiscoveryIntent } = await c.import("lib/discovery.ts");
const { copyText, shareSite, buildHandoffPrompt, SEED_FORM_URL, PLAY_REPORT_URL, CHAT_URL } = await c.import("lib/entrance.ts");
const { GM_GUIDE } = await c.import("lib/config.ts");
const { createWebTools } = await c.import("lib/webmcp.ts");
const catalog = await c.import("app/api/stories/route.ts");
const compat = await c.import("app/api/compat/stories/route.ts");
const request = query => new Request(`https://yohaku.test/api/stories?query=${encodeURIComponent(query)}&limit=20`);
const canonical = value => JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b))));

test("release: all baseline 56 story objects are unchanged and remain playable", () => {
  const hashes = JSON.parse(readFileSync(new URL("./fixtures/release-baseline56.json", import.meta.url),"utf8"));
  assert.equal(Object.keys(hashes).length, 56);
  for (const [id, hash] of Object.entries(hashes)) {
    const story = STORIES.find(row => row.id === id);
    assert.ok(story, id);
    assert.equal(createHash("sha256").update(canonical(story)).digest("hex"), hash, id);
    assert.ok(PLAY_STORIES.some(row=>row.id === id), id);
  }
});
test("release: complete listing retains canonical order; only bounded recommendations prioritize entry points", () => {
  assert.deepEqual(listStories().map(row=>row.id), PLAY_STORIES.map(row=>row.id));
  const initial = searchStories();
  assert.equal(initial.length,3);
  assert.deepEqual(initial.map(row=>row.id), INTRO_STORY_IDS.slice(0,3));
  for(const id of INTRO_STORY_IDS) assert.ok(getStory(id),id);
});
const cases = [
  ["今日は変なのがいい", row => row.tags.includes("不思議") || row.tags.includes("コメディ")],
  ["笑いたい", row => row.tags.includes("コメディ")],
  ["今日は笑いたい。", row => row.tags.includes("コメディ")],
  ["怖くないSF", row => row.tags.includes("SF") && row.tags.includes("怖くない")],
  ["怖くない ＳＦ", row => row.tags.includes("SF") && row.tags.includes("怖くない")],
  ["怖いのは苦手", row => !row.tags.includes("ホラー") && !row.tags.includes("サバイバル")],
  ["ホラー以外", row => !row.tags.includes("ホラー")],
  ["落ち着きたい", row => row.tags.includes("穏やか")],
  ["誰かと話したい", row => row.tags.some(t=>["交流","会話","関係","友情"].includes(t))],
  ["何か作りたい", row => row.tags.some(t=>["創作","ものづくり","工作","発明"].includes(t))],
  ["冒険したい", row => row.tags.some(t=>["冒険","旅","探索","救助"].includes(t))],
  ["怖い話がいい", row => row.tags.includes("ホラー")],
];
for(const [query, predicate] of cases) test(`release: bounded mood mapping ${query}`, async()=>{
  const rows=searchStories({query,limit:20}); assert.ok(rows.length,query);
  assert.ok(rows.every(predicate),query);
  const rest=await catalog.GET(request(query)).json();
  const [tool]=createWebTools(async url=>catalog.GET(new Request(new URL(url,"https://yohaku.test"))));
  const web=await tool.execute({query,limit:20});
  assert.deepEqual(rest.stories.map(s=>s.id), rows.map(s=>s.id));
  assert.deepEqual(web.stories,rows);
  const fallback=await compat.GET(request(query)).json();
  assert.deepEqual(fallback.stories.map(s=>s.id),rows.map(s=>s.id));
});
test("release: explicit exclusions override mood recommendations",()=>{
  assert.deepEqual(searchStories({query:"笑いたい",exclude_tags:["コメディ"]}),[]);
  assert.deepEqual(searchStories({query:"怖い話がいい",exclude_tags:["ホラー"]}),[]);
  const rows=searchStories({query:"何も知らずに",exclude_tags:["料理"]});
  assert.ok(rows.length); assert.ok(rows.every(row=>!row.tags.includes("料理")&&!row.tags.includes("ホラー")));
});
test("release: supported dislikes are excluded, not positively keyword-matched",()=>{
  for(const [query, tag] of [["笑いたくない","コメディ"],["コメディは嫌い","コメディ"],["恋愛なし","恋愛"],["今日はホラーは苦手","ホラー"]]){
    const rows=searchStories({query,limit:20});assert.ok(rows.length,query);
    assert.ok(rows.every(row=>!row.tags.includes(tag)),query);
  }
  assert.equal(resolveDiscoveryIntent("zzzz").query,"zzzz");
  assert.deepEqual(searchStories({query:"zzzz"}),[]);
});
test("release: mood matching survives combined exclusions",()=>{
  for(const [query,required,excluded] of [
    ["笑いたい、ホラーなし",["コメディ"],["ホラー"]],
    ["怖くないSF、恋愛なし",["SF","怖くない"],["恋愛","ホラー"]],
    ["今日は変なのがいい、戦闘なし",[],["戦闘","ホラー"]],
  ]){
    const rows=searchStories({query,limit:20});assert.ok(rows.length,query);
    for(const row of rows){
      assert.ok(required.every(tag=>row.tags.includes(tag)),query);
      assert.ok(excluded.every(tag=>!row.tags.includes(tag)),query);
    }
  }
  assert.deepEqual(searchStories({query:"笑いたい、コメディなし"}),[]);
});
test("release: every exact title and ID still finds the original story first",()=>{
  for(const story of STORIES){
    for(const query of [story.id,story.title]) assert.equal(searchStories({query})[0]?.id,story.id,query);
  }
});
test("release: no story content is added to discovery results",async()=>{
  for(const row of (await catalog.GET(request("笑いたい")).json()).stories){
    assert.deepEqual(Object.keys(row).sort(),["id","title","summary","selection_hint","tags","story_url"].sort());
  }
});

test("release: handoff contains both usable URLs and bounded selection instructions",()=>{
  const text=buildHandoffPrompt("https://yohaku.test/");
  assert.ok(text.includes("https://yohaku.test/api/compat/stories"));
  assert.ok(text.includes("https://yohaku.test/api/stories"));
  assert.ok(text.includes("2〜3件"));assert.ok(text.includes("取得失敗"));
  assert.ok(text.includes("ホラーは希望されたときだけ"));
  assert.ok(text.length<1600);
  assert.throws(()=>buildHandoffPrompt("javascript:alert(1)"));
  assert.throws(()=>buildHandoffPrompt("http://example.com"));
});
test("release: copying never invokes sharing or sends a message",async()=>{
  const seen=[];
  assert.equal(await copyText("start",{writeText:async value=>seen.push(value)}),"copied");
  assert.deepEqual(seen,["start"]);
});
test("release: missing/denied clipboard produces explicit manual fallback",async()=>{
  assert.equal(await copyText("start"),"manual");
  assert.equal(await copyText("start",{writeText:async()=>{throw new Error("denied")}}),"manual");
});
test("release: copying waits for the actual clipboard result",async()=>{
  let resolve;let finished=false;
  const pending=copyText("start",{writeText:()=>new Promise(r=>{resolve=r})}).then(result=>{finished=true;return result});
  await Promise.resolve();assert.equal(finished,false);resolve();
  assert.equal(await pending,"copied");
});
test("release: sharing sends a site URL, not the AI instructions",async()=>{
  let payload;
  const result=await shareSite("YOHAKU","https://yohaku.test",async data=>{payload=data});
  assert.equal(result,"shared");assert.deepEqual(payload,{title:"YOHAKU",url:"https://yohaku.test"});
});
test("release: cancelling the share sheet neither copies nor raises an error",async()=>{
  let copies=0;
  const result=await shareSite("x","https://yohaku.test",async()=>{throw {name:"AbortError"}}, {writeText:async()=>{copies++}});
  assert.equal(result,"cancelled");assert.equal(copies,0);
});
test("release: sharing fallback copies only the site URL and can fail safely",async()=>{
  let payload;
  const port={writeText:async text=>{payload=text}};
  assert.equal(await shareSite("x","https://yohaku.test",undefined,port),"copied");
  assert.equal(payload,"https://yohaku.test");
  assert.equal(await shareSite("x","https://yohaku.test",async()=>{throw new Error("unsupported")},port),"copied");
  assert.equal(await shareSite("x","https://yohaku.test"),"manual");
});
test("release: issue links target the known forms; the chat link has no auto-send data",()=>{
  for(const [href,template] of [[SEED_FORM_URL,"seed.yml"],[PLAY_REPORT_URL,"play-report.yml"]]){
    const url=new URL(href);assert.equal(url.origin,"https://github.com");
    assert.equal(url.pathname,"/Unjuno/yohaku/issues/new");assert.equal(url.searchParams.get("template"),template);
  }
  assert.equal(new URL(CHAT_URL).search,"");
});
test("release: real TSX parses; primary button is wired to copy-start, not share",()=>{
  const source=readFileSync(new URL("../components/yohaku-experience.tsx",import.meta.url),"utf8");
  const ast=ts.createSourceFile("page.tsx",source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  assert.deepEqual(ast.parseDiagnostics,[]);
  let primary;
  function visit(node){
    if(ts.isJsxOpeningElement(node) && node.tagName.getText(ast)==="button"){
      const action=node.attributes.properties.find(a=>ts.isJsxAttribute(a)&&a.name.getText(ast)==="data-action");
      if(action?.initializer?.text==="copy-start")primary=node;
    }
    ts.forEachChild(node,visit);
  }
  visit(ast);assert.ok(primary);
  const click=primary.attributes.properties.find(a=>ts.isJsxAttribute(a)&&a.name.getText(ast)==="onClick");
  assert.equal(click.initializer.expression.getText(ast),"start");
  assert.ok(source.includes('href={SEED_FORM_URL}'));assert.ok(source.includes('href={PLAY_REPORT_URL}'));
  assert.ok(source.includes('aria-label={dialogKind'));assert.ok(source.includes('まだ送信やゲーム開始は行っていません'));
  assert.ok(!source.includes('<strong>JSON API</strong>'));
});
test("release: guide has tutorial, status, pause and internal-rule separation (static, not LLM proof)",()=>{
  for(const term of ["【Progressive Commitment】","【No Player Worldbuilding Burden】","今の状況は？","何ができる？","中断","通常のプレイ描写","ホラーは明示的に希望されたときだけ","利用者が仕組みを尋ねたときは事実どおり"]){
    assert.ok(GM_GUIDE.includes(term),term);
  }
});

test("entrance: motion fails open and respects background tabs (source contract, not browser QA)",()=>{
  const source=readFileSync(new URL("../components/yohaku-experience.tsx",import.meta.url),"utf8");
  const css=readFileSync(new URL("../app/globals.css",import.meta.url),"utf8");
  assert.ok(source.includes('!("IntersectionObserver" in window)'));
  assert.ok(source.includes('document.addEventListener("visibilitychange", updateVisibility)'));
  assert.ok(source.includes('document.removeEventListener("visibilitychange", updateVisibility)'));
  assert.ok(css.includes('animation-play-state: paused !important'));
  assert.ok(css.includes('.reveal-ready [data-reveal]:focus-within'));
  assert.match(css,/@media \(prefers-reduced-motion: reduce\)[\s\S]*opacity: 1; transform: none/);
});

test("entrance: copy success and manual fallback retain distinct readable surfaces (source contract)",()=>{
  const source=readFileSync(new URL("../components/yohaku-experience.tsx",import.meta.url),"utf8");
  const css=readFileSync(new URL("../app/globals.css",import.meta.url),"utf8");
  assert.ok(source.includes('copied && dialogKind === "start"'));
  assert.ok(source.includes('className="copied-message"'));
  assert.ok(source.includes('ref={textareaRef}'));
  assert.ok(source.includes('className="handoff-next"'));
  assert.ok(css.includes('max-height: calc(100svh - 2rem)'));
  assert.ok(css.includes('white-space: normal'));
  assert.ok(!source.includes('className="step-image"'));
});
