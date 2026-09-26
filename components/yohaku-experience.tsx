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
import { buildHandoffPrompt, copyText, shareSite, CHAT_URL, SEED_FORM_URL, PLAY_REPORT_URL } from "@/lib/entrance";

type Config = { name: string; nameEn: string; siteUrl: string; sponsorsUrl: string };

export function YohakuExperience({ config }: { config: Config }) {
  const [manualText, setManualText] = useState("");
  const [manualTitle, setManualTitle] = useState("手動でコピー");
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [dialogKind, setDialogKind] = useState<"start" | "manual">("manual");
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const startingRef = useRef(false);
  const [webMcp, setWebMcp] = useState<"checking" | "ready" | "unavailable">("checking");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const context = (document as Document & { modelContext?: WebModelContext }).modelContext;
    return startWebMcp(context, setWebMcp);
  }, []);

  useEffect(() => { if (fallbackOpen) requestAnimationFrame(() => textareaRef.current?.select()); }, [fallbackOpen]);

  useEffect(() => {
    const updateVisibility = () => document.documentElement.classList.toggle("page-hidden", document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
      document.documentElement.classList.remove("page-hidden");
    };
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
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
    }, { rootMargin: "0px 0px -24px", threshold: 0 });
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("reveal-ready");
    };
  }, []);

  const mcpUrl = `${config.siteUrl}/api/mcp`;
  const apiUrl = `${config.siteUrl}/api/stories`;
  const compatUrl = `${config.siteUrl}/api/compat/stories`;
  const handoffPrompt = buildHandoffPrompt(config.siteUrl);

  const copy = async (text: string, label: string, description = "送信や接続はまだ行っていません。") => {
    const result = await copyText(text, navigator.clipboard);
    if (result === "copied") {
      toast.success(`${label}をコピーしました`, { description });
    } else {
      setDialogKind("manual");
      setManualTitle(`${label}を手動でコピー`);
      setManualText(text);
      setCopied(false);
      setFallbackOpen(true);
    }
  };

  const start = async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    setStarting(true);
    try {
      const result = await copyText(handoffPrompt, navigator.clipboard);
      setDialogKind("start");
      setManualTitle("AIに貼り付けて始める");
      setManualText(handoffPrompt);
      setCopied(result === "copied");
      setFallbackOpen(true);
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  };

  const shareEntrance = async () => {
    const result = await shareSite(`${config.name} / ${config.nameEn}`, config.siteUrl,
      navigator.share ? navigator.share.bind(navigator) : undefined, navigator.clipboard);
    if (result === "cancelled") return;
    if (result === "shared") toast.success("共有操作が完了しました");
    else if (result === "copied") toast.success("リンクをコピーしました");
    else {
      setDialogKind("manual");
      setManualTitle("リンクを手動でコピー");
      setManualText(config.siteUrl);
      setCopied(false);
      setFallbackOpen(true);
    }
  };

  return (
    <main>
      <Toaster position="bottom-center" richColors closeButton />

      <section id="top" className="hero" aria-labelledby="hero-title">
        <div className="hero-texture" aria-hidden="true"><img src="/textures/threshold.webp" alt="" fetchPriority="high" /></div>
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-brand"><strong>{config.nameEn}</strong><span>AI SOLO TRPG</span><span className="brand-jp" aria-hidden="true">余白</span></div>
        <div className="hero-copy">
          <h1 id="hero-title">目を閉じる。<br /><em>あとは、話すだけ。</em></h1>
          <p>AIと声で遊ぶ、即興TRPG。<br />決まっているのは、世界観と最初の瞬間だけ。</p>
          <button className="entrance-cta" data-action="copy-start" onClick={start} disabled={starting} aria-busy={starting}><span>{starting ? "コピーしています…" : "開始メッセージをコピー"}</span><ArrowUpRight size={26} aria-hidden /></button>
          <small>ChatGPTなどに貼り付けて送信。<br className="mobile-break" />テキストでも遊べます。</small>
        </div>
        <a className="hero-scroll" href="#how" aria-label="遊び方へ"><span>HOW TO PLAY</span><ArrowDown size={16} aria-hidden /></a>
      </section>

      <section id="how" className="how" aria-labelledby="how-title" data-reveal>
        <header><p className="section-label">HOW TO PLAY</p><h2 id="how-title">入口は、<br />いつもの会話。</h2></header>
        <div className="steps" aria-label="遊び方の3ステップ">
          <article><span>01</span><h3>渡す。</h3><p>コピーして、AIのチャットへ貼る。</p></article>
          <article><span>02</span><h3>話す。</h3><p>今の気分を、そのまま。</p></article>
          <article><span>03</span><h3>始まる。</h3><p>設定を取得したAIが、GMになる。</p></article>
        </div>
        <blockquote><p>「何も知らずに」</p><p>「怖くないSF」</p><p>「今日は変なのがいい」</p></blockquote>
      </section>

      <section id="voice" className="voice" aria-labelledby="voice-title" data-reveal>
        <div className="voice-texture" aria-hidden="true"><img src="/textures/voice-folds.webp" alt="" loading="lazy" /></div>
        <div className="voice-shade" aria-hidden="true" />
        <div className="voice-heading"><p className="section-label">VOICE EXPERIENCE</p><h2 id="voice-title">音声なら、<br />目を閉じて。</h2></div>
        <div className="voice-copy"><p>リアルタイム音声を始めたら、<br />安全で静かな場所に座って。<br />よければ照明を落とし、目を閉じる。</p><p>あとは、思ったことを<br />そのまま話す。</p><small>テキストでも遊べます。歩行中・運転中などは目を閉じないでください。</small></div>
      </section>

      <footer id="share" className="site-footer" data-reveal>
        <div className="footer-texture" aria-hidden="true"><img src="/textures/shared-horizon.webp" alt="" loading="lazy" /></div>
        <div className="share-block"><p className="section-label">SHARE</p><h2>面白かったら、<br />この入口を誰かにも。</h2><button className="share-cta" onClick={shareEntrance}>リンクを共有<ArrowUpRight size={22} aria-hidden /></button></div>
        <div className="support-line"><span>楽しめたら制作を支援</span>{config.sponsorsUrl && <a href={config.sponsorsUrl} target="_blank" rel="noreferrer">GitHub Sponsorsで支援<ExternalLink size={14} aria-hidden /></a>}</div>
        <details className="agents-disclosure">
          <summary>For Agents <span aria-hidden>⌄</span></summary>
          <div className="agent-content">
            <article><div><span className={`status-dot ${webMcp}`} /><strong>WebMCP / Site Tools</strong></div><p><code>search_stories</code> / <code>get_story</code></p><small>{webMcp === "ready" ? "このブラウザで利用可能" : webMcp === "checking" ? "対応状況を確認しています" : "このブラウザでは利用できません"}</small></article>
            <article><div><span className="status-dot" /><strong>Story Catalog</strong></div><p><a href={apiUrl} target="_blank" rel="noreferrer">{apiUrl}</a></p><button onClick={() => copy(apiUrl, "Catalog URL")}><Copy size={14} aria-hidden />URLをコピー</button><small>公開作品の一覧</small></article>
            <article><div><span className="status-dot" /><strong>Remote MCP</strong></div><p><a href={mcpUrl} target="_blank" rel="noreferrer">{mcpUrl}</a></p><button onClick={() => copy(mcpUrl, "Remote MCP URL")}><Link2 size={14} aria-hidden />URLをコピー</button><small>MCP接続先</small></article>
            <article><div><strong>一回取得用</strong></div><p><a href={compatUrl} target="_blank" rel="noreferrer">{compatUrl}</a></p><button onClick={() => copy(compatUrl, "互換Catalog URL")}><Copy size={14} aria-hidden />URLをコピー</button><small>代表作品の一部と共通ガイド。全作品一覧ではありません。</small></article>
          </div>
        </details>
        <nav className="community-links" aria-label="投稿と問題報告"><a href={SEED_FORM_URL} target="_blank" rel="noreferrer">世界を投稿する</a><a href={PLAY_REPORT_URL} target="_blank" rel="noreferrer">遊んだ感想・問題を送る</a><small>GitHubへのログインが必要です。投稿内容は公開されます。</small></nav>
        <div className="colophon"><span>{config.name} / {config.nameEn}</span><Link href="/review">制作レビュー</Link><span>WORLD &amp; BEGINNING, THEN YOUR VOICE.</span></div>
      </footer>

      <Dialog open={fallbackOpen} onOpenChange={setFallbackOpen}>
        <DialogContent className="fallback-dialog">
          <DialogHeader>
            <DialogTitle>{manualTitle}</DialogTitle>
            <DialogDescription>
              {dialogKind === "start"
                ? (copied ? "コピーしました。AIのチャットを開き、貼り付けて送信してください。" : "自動コピーが使えませんでした。下の欄をコピーし、AIのチャットに貼り付けて送信してください。")
                : "下の欄を選択してコピーしてください。"}
              まだ送信やゲーム開始は行っていません。
            </DialogDescription>
          </DialogHeader>
          {copied && dialogKind === "start" ? <details className="copied-message"><summary>コピーした文章を確認</summary><textarea value={manualText} readOnly aria-label="コピーした開始メッセージ" /></details> : <textarea ref={textareaRef} value={manualText} readOnly aria-label={dialogKind === "start" ? "AIに貼り付ける開始メッセージ" : "手動コピー用テキスト"} />}
          {dialogKind === "start" && <div className="handoff-next">
            <a href={CHAT_URL} target="_blank" rel="noreferrer">ChatGPTを開く <ExternalLink size={18} aria-hidden /></a>
            <small>ほかの対応AIにも貼れます。AI側のログイン・機能・利用制限はサービスごとに異なります。</small>
          </div>}
        </DialogContent>
      </Dialog>
    </main>
  );
}
