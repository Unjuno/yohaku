/** Editorial entry points, not popularity scores or a general language parser. */
export const INTRO_STORY_IDS = [
  "moon-diner", "last-post", "monster-hotel", "unmapped-planet",
  "rain-orchestra", "wind-regatta", "robot-holiday", "room-falling",
] as const;

export type DiscoveryIntent = {
  query: string;
  anyTags: readonly string[];
  requiredTags: readonly string[];
  excludedTags: readonly string[];
  introductory: boolean;
};
const empty = { anyTags: [], requiredTags: [], excludedTags: [], introductory: false } as const;
const moods: readonly { phrases: readonly string[]; anyTags?: readonly string[]; requiredTags?: readonly string[]; excludedTags?: readonly string[]; introductory?: boolean }[] = [
  { phrases: ["おまかせ", "何も知らずに", "おすすめ"], excludedTags: ["ホラー"], introductory: true },
  { phrases: ["笑いたい", "笑える", "笑えるもの", "笑える話", "笑えるのがいい"], requiredTags: ["コメディ"], excludedTags: ["ホラー"] },
  { phrases: ["変なのがいい", "変なの", "変な世界", "不思議な世界", "不思議な世界に行きたい"], anyTags: ["不思議", "コメディ"], excludedTags: ["ホラー"] },
  { phrases: ["落ち着きたい", "のんびりしたい", "ゆっくりしたい", "癒されたい", "静かに遊びたい"], requiredTags: ["穏やか"], excludedTags: ["ホラー"] },
  { phrases: ["話したい", "静かに話す", "誰かと話したい", "会話したい"], anyTags: ["交流", "会話", "関係", "友情"], excludedTags: ["ホラー"] },
  { phrases: ["冒険したい", "冒険する"], anyTags: ["冒険", "旅", "探索", "救助"] },
  { phrases: ["作りたい", "何か作りたい", "ものを作りたい"], anyTags: ["創作", "ものづくり", "工作", "発明"] },
  { phrases: ["怖いのがいい", "怖い話", "怖い話がいい", "怖いもの", "怖いものがいい"], requiredTags: ["ホラー"] },
  { phrases: ["怖くないsf", "怖くないsfがいい", "怖くないsfを遊びたい"], requiredTags: ["sf", "怖くない"], excludedTags: ["ホラー"] },
  { phrases: ["怖くない", "怖くないもの", "怖くないものがいい", "怖いのは苦手", "ホラー以外"], anyTags: ["穏やか", "怖くない", "コメディ"], excludedTags: ["ホラー", "戦闘", "サバイバル", "静かな不安", "静かな緊張"] },
];

export function resolveDiscoveryIntent(query: string): DiscoveryIntent {
  const normalized = query.normalize("NFKC").toLocaleLowerCase("ja").trim();
  const key = normalized.replace(/\s+/g, "").replace(/[。!！?？]+$/u, "").replace(/^(?:今日は|今は|いまは)/u, "");
  const mood = moods.find(item => item.phrases.includes(key));
  if (!mood) {
    // Remove supported dislikes before the legacy keyword scorer can treat them as positive matches.
    const excludedTags: string[] = [];
    let remaining = normalized.replace(/(ホラー|コメディ|戦闘|恋愛|救助)(?:は|が|を)?(?:苦手|嫌い|なし|抜き|以外|避けたい)/gu,
      (_match, tag: string) => { excludedTags.push(tag); return ""; });
    remaining = remaining.replace(/笑いたくない/gu, () => { excludedTags.push("コメディ"); return ""; });
    if (excludedTags.length) {
      remaining = remaining.replace(/^(?:今日は|今は|いまは)/u, "").replace(/^[\s、,。・の]+|[\s、,。・]+$/gu, "");
      return { ...empty, query: remaining, excludedTags, introductory: !remaining };
    }
    return { ...empty, query: normalized };
  }
  return {
    query: "", anyTags: mood.anyTags ?? [], requiredTags: mood.requiredTags ?? [],
    excludedTags: mood.excludedTags ?? [], introductory: mood.introductory ?? false,
  };
}
