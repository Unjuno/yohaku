import type { Metadata } from "next";
import Link from "next/link";
import type { PublicReviewStory } from "@/lib/review-data";
import { REVIEW_DATA } from "@/lib/review-data";

export const metadata: Metadata = {
  title: "Seed Review — 余白 / YOHAKU",
  description: "YOHAKUの配信中作品と未採用Seedを読む、制作者向けの閲覧専用ページ。",
  robots: { index: false, follow: false },
};

function StoryReview({ story, status }: { story: PublicReviewStory; status: "プレイ配信中" | "未採用Seed" }) {
  return (
    <details className="review-story">
      <summary>
        <span className={`review-status ${status === "プレイ配信中" ? "is-live" : "is-candidate"}`}>{status}</span>
        <span className="review-story-title"><strong>{story.title}</strong><small>{story.id}</small></span>
        <span className="review-verdict">{story.selection_hint}</span>
        <span className="review-chevron" aria-hidden>＋</span>
      </summary>
      <div className="review-story-body">
        <section className="review-invitation"><p className="review-kicker">SELECTION</p><p>{story.summary}</p></section>
        <p className="review-tags">{story.tags.join(" / ")}</p>
        <div className="review-text-grid">
          <section><h3>世界観 — world</h3><p>{story.world}</p></section>
          <section><h3>開始時点 — initial_state</h3><p>{story.initial_state}</p></section>
        </div>
        <section className="review-seed-note"><h3>Seed review</h3><p>{story.review_note}</p></section>
      </div>
    </details>
  );
}

function Collection({ title, eyebrow, description, stories, status }: { title: string; eyebrow: string; description: string; stories: readonly PublicReviewStory[]; status: "プレイ配信中" | "未採用Seed" }) {
  return (
    <section className="review-collection">
      <header><p className="review-kicker">{eyebrow}</p><h2>{title}</h2><p>{description}</p></header>
      <div className="review-story-list">{stories.map((story) => <StoryReview key={story.id} story={story} status={status} />)}</div>
    </section>
  );
}

export default function ReviewPage() {
  return (
    <main className="review-page">
      <header className="review-header">
        <nav><Link href="/">YOHAKUへ戻る</Link><a href="/review/data.json">同じ内容をJSONで読む</a></nav>
        <p className="review-notice">{REVIEW_DATA.meta.notice}</p>
        <h1>世界と、<br />最初の瞬間。</h1>
        <p className="review-lead">{REVIEW_DATA.seed_review.principle}</p>
        <div className="review-legend" aria-label="表示状態">
          <span className="review-status is-live">プレイ配信中</span>
          {REVIEW_DATA.unadopted_candidates.length > 0 && <span className="review-status is-candidate">未採用Seed</span>}
        </div>
      </header>

      <section className="review-summary" aria-labelledby="seed-criteria-title">
        <div><p className="review-kicker">SEED REVIEW</p><h2 id="seed-criteria-title">見るのは、<br />この三つ。</h2></div>
        <dl className="review-seed-criteria">
          <div><dt>WORLD</dt><dd>{REVIEW_DATA.seed_review.world}</dd></div>
          <div><dt>INITIAL STATE</dt><dd>{REVIEW_DATA.seed_review.initial_state}</dd></div>
          <div><dt>IMPROVISATION</dt><dd>{REVIEW_DATA.seed_review.improvisation}</dd></div>
        </dl>
      </section>

      <Collection title="プレイ配信中" eyebrow="CURRENT PLAY" description="現在のsearch_stories / get_storyが参照する作品です。" stories={REVIEW_DATA.current_play} status="プレイ配信中" />
      {REVIEW_DATA.unadopted_candidates.length > 0 && <Collection title="未採用Seed" eyebrow="REVIEW ONLY" description="内容は閲覧できますが、通常のプレイAPIやMCPにはまだ含まれません。" stories={REVIEW_DATA.unadopted_candidates} status="未採用Seed" />}

      <section className="review-guides">
        <header><p className="review-kicker">COMMON GUIDE</p><h2>{REVIEW_DATA.gm_guide.label}</h2><p>全作品で共通する、即興を壊さず進めるためのルールです。</p></header>
        <div><details><summary><strong>全文を読む</strong><span aria-hidden>＋</span></summary><p>{REVIEW_DATA.gm_guide.text}</p></details></div>
      </section>

      <footer className="review-footer"><p>{REVIEW_DATA.meta.source_note}</p><p>閲覧専用。保存・採用・公開・削除・生成の操作はありません。</p><a href="/review/data.json">同じ原本をJSONで一度に取得</a></footer>
    </main>
  );
}
