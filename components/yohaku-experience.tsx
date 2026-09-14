/* Generated textures are already manually compressed WebP assets; plain img keeps decorative cropping predictable. */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Copy, ExternalLink, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { startWebMcp, type WebModelContext } from "@/lib/webmcp";

type Config = { name: string; nameEn: string; siteUrl: string; sponsorsUrl: string };

export function YohakuExperience({ config }: { config: Config }) {
  const [manualText, setManualText] = useState("");
  const [manualTitle, setManualTitle] = useState("手動でコピー");
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [webMcp, setWebMcp] = useState<"checking" | "ready" | "unavailable">("checking");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const context = (document as Document & { modelContext?: WebModelContext }).modelContext;
    return startWebMcp(context, setWebMcp);
  }, []);

  useEffect(() => { if (fallbackOpen) requestAnimationFrame(() => textareaRef.current?.select()); }, [fallbackOpen]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    document.documentElement.classList.add("reveal-ready");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12%", threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("reveal-ready");
    };
  }, []);

  const mcpUrl = `${config.siteUrl}/api/mcp`;
  const apiUrl = `${config.siteUrl}/api/stories`;
  const compatUrl = `${config.siteUrl}/api/compat/stories`;
  const handoffPrompt = `YOHAKUで即興TRPGを遊びたいです。

今の気分を必要なら0〜1問だけ確認してください。MCP / Site Toolsが使える場合はsearch_storiesで候補を探し、作品決定後にget_storyを使ってください。

使えない場合は、次の互換Catalogを一度取得してください。おすすめ作品のworldとinitial_state、共通のgm_guideが入っています。全作品ではありません。希望に合わなければcatalog_urlの一覧から探してください。
${compatUrl}

私の希望に合う作品を決めたら、取得したworld、initial_state、gm_guideを使ってGMとして始めてください。取得できない場合は、取得できたふりをせず伝えてください。

YOHAKU:
${config.siteUrl}/`;

  const copy = async (text: string, label: string, description = "送信や接続はまだ行っていません。") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}をコピーしました`, { description });
    } catch {
      setManualTitle(`${label}を手動でコピー`);
      setManualText(text);
      setFallbackOpen(true);
      toast.error("自動コピーが許可されませんでした", { description: "表示した欄から手動でコピーできます。" });
    }
  };

  const shareEntrance = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${config.name} / ${config.nameEn}`, text: handoffPrompt, url: config.siteUrl });
        toast.success("共有操作が完了しました", { description: "共有先は端末の共有画面で選ばれた内容です。" });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copy(handoffPrompt, "開始メッセージ", "AIとのチャットに貼り付けてください。接続やゲーム開始はまだ行っていません。");
  };

  return (
    <main>
      <Toaster position="bottom-center" richColors closeButton />

      <section id="top" className="hero" aria-labelledby="hero-title">
        <div className="hero-texture" aria-hidden="true"><img src="/textures/threshold.webp" alt="" fetchPriority="high" /></div>
        <div className="portal-fallback" aria-hidden="true"><span /><span /><span /></div>
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-brand"><strong>{config.nameEn}</strong><span>AI SOLO TRPG</span></div>
        <div className="hero-copy">
          <h1 id="hero-title">目を閉じる。<br /><em>あとは、話すだけ。</em></h1>
          <p>AIと声で遊ぶ、即興TRPG。<br />決まっているのは、世界観と最初の瞬間だけ。</p>
          <button className="entrance-cta" data-copy-catalog={apiUrl} onClick={shareEntrance}><span>AIで始める</span><ArrowUpRight size={26} aria-hidden /></button>
          <small>ChatGPTなどに貼り付けるだけ。テキストでも遊べます。</small>
        </div>
        <a className="hero-scroll" href="#how" aria-label="遊び方へ"><span>HOW TO PLAY</span><ArrowDown size={16} aria-hidden /></a>
      </section>

      <section id="how" className="how" aria-labelledby="how-title" data-reveal>
        <header><p className="section-label">HOW TO PLAY</p><h2 id="how-title">三つの言葉で、<br />向こう側へ。</h2></header>
        <div className="steps" aria-label="遊び方の3ステップ">
          <article><div className="step-image"><img src="/textures/threshold.webp" alt="" loading="lazy" /></div><span>01</span><h3>渡す。</h3><p>この入口をAIへ。</p></article>
          <article><div className="step-image"><img src="/textures/voice-folds.webp" alt="" loading="lazy" /></div><span>02</span><h3>話す。</h3><p>今の気分を、そのまま。</p></article>
          <article><div className="step-image"><img src="/textures/shared-horizon.webp" alt="" loading="lazy" /></div><span>03</span><h3>始まる。</h3><p>AIが世界を選び、GMになる。</p></article>
        </div>
        <blockquote><p>「何も知らずに」</p><p>「怖くないSF」</p><p>「今日は変なのがいい」</p></blockquote>
      </section>

      <section id="voice" className="voice" aria-labelledby="voice-title" data-reveal>
        <div className="voice-texture" aria-hidden="true"><img src="/textures/voice-folds.webp" alt="" loading="lazy" /></div>
        <div className="voice-shade" aria-hidden="true" />
        <div className="voice-heading"><p className="section-label">VOICE EXPERIENCE</p><h2 id="voice-title">音声なら、<br />目を閉じて。</h2></div>
        <div className="voice-copy"><p>安全で静かな場所に座って。<br />よければ照明を落とし、目を閉じる。</p><p>あとは、思ったことを<br />そのまま話す。</p><small>テキストでも遊べます。歩行中・運転中などは目を閉じないでください。</small></div>
      </section>

      <footer id="share" className="site-footer" data-reveal>
        <div className="footer-texture" aria-hidden="true"><img src="/textures/shared-horizon.webp" alt="" loading="lazy" /></div>
        <div className="share-block"><p className="section-label">SHARE</p><h2>面白かったら、<br />この入口を誰かにも。</h2><button className="share-cta" onClick={shareEntrance}>リンクを共有<ArrowUpRight size={22} aria-hidden /></button></div>
        <div className="support-line"><span>楽しめたら制作を支援</span>{config.sponsorsUrl && <a href={config.sponsorsUrl} target="_blank" rel="noreferrer">GitHub Sponsorsで支援<ExternalLink size={14} aria-hidden /></a>}</div>
        <details className="agents-disclosure">
          <summary>For Agents <span aria-hidden>⌄</span></summary>
          <div className="agent-content">
            <article><div><span className={`status-dot ${webMcp}`} /><strong>WebMCP / Site Tools</strong></div><p><code>search_stories</code> / <code>get_story</code></p><small>{webMcp === "ready" ? "このブラウザで利用可能" : webMcp === "checking" ? "対応状況を確認しています" : "このブラウザでは利用できません"}</small></article>
            <article><div><span className="status-dot ready" /><strong>Story Catalog</strong></div><p><a href={apiUrl} target="_blank" rel="noreferrer">{apiUrl}</a></p><button onClick={() => copy(apiUrl, "Catalog URL")}><Copy size={14} aria-hidden />URLをコピー</button><small>公開作品の一覧</small></article>
            <article><div><span className="status-dot ready" /><strong>Remote MCP</strong></div><p><a href={mcpUrl} target="_blank" rel="noreferrer">{mcpUrl}</a></p><button onClick={() => copy(mcpUrl, "Remote MCP URL")}><Link2 size={14} aria-hidden />URLをコピー</button><small>MCP接続先</small></article>
            <article><div><span className="status-dot ready" /><strong>JSON API</strong></div><p><a href={apiUrl} target="_blank" rel="noreferrer">{apiUrl}</a></p><button onClick={() => copy(apiUrl, "API URL")}><Copy size={14} aria-hidden />URLをコピー</button><small>読み取り用API</small></article>
          </div>
        </details>
        <div className="colophon"><span>{config.name} / {config.nameEn}</span><Link href="/review">制作レビュー</Link><span>WORLD &amp; BEGINNING, THEN YOUR VOICE.</span></div>
      </footer>

      <Dialog open={fallbackOpen} onOpenChange={setFallbackOpen}><DialogContent className="fallback-dialog"><DialogHeader><DialogTitle>{manualTitle}</DialogTitle><DialogDescription>下の欄を選択してコピーしてください。これはAIへの接続やゲーム開始を意味しません。</DialogDescription></DialogHeader><textarea ref={textareaRef} value={manualText} readOnly aria-label="手動コピー用テキスト" /></DialogContent></Dialog>
    </main>
  );
}
