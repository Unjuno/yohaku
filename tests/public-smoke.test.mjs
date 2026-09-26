// Tests the release checker against local protocol fixtures, not a deployed app or browser.
import assert from "node:assert/strict";
import { test, after } from "node:test";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { compileSources } from "./load-source.mjs";

const root=fileURLToPath(new URL("../",import.meta.url));
const c=compileSources(root,["lib/config.ts","lib/discovery.ts","lib/story-contract.ts","lib/stories.ts","lib/additional-seeds.ts","lib/experience-gap-seeds.ts","lib/field-seeds.ts","lib/story-http.ts","app/api/stories/route.ts","app/api/compat/stories/route.ts"]);
after(c.clean);
const {getStory,PLAY_STORIES}=await c.import("lib/stories.ts");
const catalog=await c.import("app/api/stories/route.ts");
const compat=await c.import("app/api/compat/stories/route.ts");

async function runFixture(mutation) {
  let origin;
  const server=createServer(async(req,res)=>{
    try {
      const url=new URL(req.url,origin);
      let body;
      if(url.pathname==="/"){
        res.setHeader("content-type","text/html");
        res.end(mutation==="missing-links" ? "<main>開始メッセージをコピー</main>" : '<main>開始メッセージをコピー<a href="https://github.com/Unjuno/yohaku/issues/new?template=seed.yml">Seed</a><a href="https://github.com/Unjuno/yohaku/issues/new?template=play-report.yml">Report</a></main>');
        return;
      }
      if(url.pathname==="/api/stories" || url.pathname==="/api/compat/stories"){
        body=await (url.pathname==="/api/stories"?catalog:compat).GET(new Request(url)).json();
        body.stories=body.stories.map(row=>({...row,story_url:`${origin}/api/stories/${row.id}`}));
      } else {
        const story=getStory(decodeURIComponent(url.pathname.split("/").at(-1)));
        if(!story){res.statusCode=404;res.end();return;}
        body={...story};
        if(mutation==="stale-guide")body.gm_guide="stale guide";
      }
      res.setHeader("content-type","application/json");res.end(JSON.stringify(body));
    } catch(error){res.statusCode=500;res.end(String(error));}
  });
  await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolve);});
  origin=`http://127.0.0.1:${server.address().port}`;
  try {
    return await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,["scripts/check-public-beta.mjs","--url",origin],{cwd:root,timeout:20000});
      let out="",err="";child.stdout.on("data",chunk=>out+=chunk);child.stderr.on("data",chunk=>err+=chunk);
      child.once("error",reject);child.once("close",code=>{
        try{resolve({code,report:JSON.parse(out),stderr:err});}catch(error){reject(new Error(`${error}\n${out}\n${err}`));}
      });
    });
  } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}

test("release checker: local protocol fixture reaches all checks (not deployment verification)",async()=>{
  const result=await runFixture("normal");assert.equal(result.code,0,result.stderr);assert.equal(result.report.result,"PASS");
  assert.equal(result.report.checks.length,4);assert.equal(result.report.checks[0].count,PLAY_STORIES.length);
  assert.ok(result.report.not_tested.includes("LLM_play"));
});
test("release checker: stale deployed guide would fail instead of accepting count alone",async()=>{
  const result=await runFixture("stale-guide");assert.equal(result.code,1);assert.equal(result.report.result,"FAIL");
  assert.ok(result.report.error.includes("gm_guide differs from checkout"));
});
test("release checker: missing SSR community links would fail",async()=>{
  const result=await runFixture("missing-links");assert.equal(result.code,1);assert.equal(result.report.result,"FAIL");
  assert.ok(result.report.error.includes("community entry links missing"));
});
