import { GM_GUIDE } from "./config";
import { PLAY_STORY_IDS, PLAY_STORIES, STORIES, type Story } from "./stories";

export type PublicReviewStory = Pick<
  Story,
  "id" | "title" | "summary" | "selection_hint" | "tags" | "world" | "initial_state"
> & {
  review_note: string;
};

const REVIEW_NOTES: Readonly<Record<string, string>> = {
  "moon-diner": "交流と創作の種。客の言葉と厨房の品から、会話ごとに異なる一皿へ進めるかを見る。",
  "clockwork-rescue": "救助と道具の種。観察した機械獣の反応を保持しつつ、異なる助け方へ応答できるかを見る。",
  "room-falling": "静かな緊張の種。部屋、保守盤、住人という足場から、調査にも連絡にも進めるかを見る。",
  "last-post": "旅と探索の種。手紙、地図、記録を調べた際に、GMが具体情報を提示して保持できるかを見る。",
  "memory-city": "自己認識と制度の種。行政上の矛盾を固定された答えへ閉じず、生活の手掛かりから具体化できるかを見る。",
  "dragon-pass": "交渉の種。人物の事情を会話で具体化し、最初から正しい合意案を持たずに進められるかを見る。",
  "bandit-pass": "護衛と道選びの種。地図や証言を具体化し、戦闘だけでない進み方へ応答できるかを見る。",
  "ruin-vault": "探索と仕掛けの種。観察された機構の物理的反応を保持し、想定外の試行にも答えられるかを見る。",
  "dragon-fort": "作戦と対決の種。観察で竜の特徴を具体化し、能力表や唯一の攻略法へ固定しないかを見る。",
  "missing-gem": "即興ミステリーの種。証言や物証を提示した瞬間から保持し、後付けで事件を変えないかを見る。",
  "abandoned-hospital": "捜索とホラーの種。遭遇した現象の性質を保持しつつ、事前の攻略条件へ閉じないかを見る。",
  "unmapped-planet": "穏やかな調査の種。未知の地点を観測時に具体化し、怖さへ転調せず発見を続けられるかを見る。",
  "drifting-rescue": "宇宙救助の種。船体や機材を調査時に具体化し、専門知識をプレイヤーへ要求しないかを見る。",
  "snow-survival": "判断と生還の種。天候や備えを観測時に具体化し、単一の正解や現実の救命教材へしないかを見る。",
  "masked-ball": "社交潜入の種。人物と屋敷を会話中に具体化し、確認済みの関係や警戒を保持できるかを見る。",
  "shinobi-rescue": "偵察と救出の種。見聞きした地理や警備を保持し、未確認の障害を後付けしないかを見る。",
};

function toPublicReviewStory(story: Story): PublicReviewStory {
  return {
    id: story.id,
    title: story.title,
    summary: story.summary,
    selection_hint: story.selection_hint,
    tags: [...story.tags],
    world: story.world,
    initial_state: story.initial_state,
    review_note: REVIEW_NOTES[story.id] ?? "世界と最初の瞬間だけで、次の行動が生まれるかを見る。",
  };
}

const playIds = new Set<string>(PLAY_STORY_IDS);

export const REVIEW_DATA = {
  meta: {
    title: "YOHAKU Seed Review",
    notice: "制作者向け・作品内容を含む・閲覧のみ",
    read_only: true,
    source_note: "表示内容は作品原本から生成されています。未採用候補は通常のプレイAPIやMCPには含まれません。",
  },
  seed_review: {
    principle: "世界と最初の瞬間だけ決める。その先は、会話の中で初めて決まる。",
    world: "世界の基本法則、文化、作品固有の前提が想像を起こすか。",
    initial_state: "現在地と刺激が分かり、人・物・場所・音・記録・装置のうち複数へ自然に働きかけられるか。",
    improvisation: "未提示の細部をGMが具体化でき、一度提示した事実をその回で保持できるか。",
  },
  gm_guide: {
    label: "共通GMガイド",
    text: GM_GUIDE,
  },
  current_play: PLAY_STORIES.map(toPublicReviewStory),
  unadopted_candidates: STORIES.filter((story) => !playIds.has(story.id)).map(toPublicReviewStory),
} as const;
