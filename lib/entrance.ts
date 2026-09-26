/** Pure handoff helpers. No automatic account connection, message send or telemetry. */
export const COMMUNITY_URL = "https://github.com/Unjuno/yohaku";
export const SEED_FORM_URL = `${COMMUNITY_URL}/issues/new?template=seed.yml`;
export const PLAY_REPORT_URL = `${COMMUNITY_URL}/issues/new?template=play-report.yml`;
export const CHAT_URL = "https://chatgpt.com/";

export function buildHandoffPrompt(siteUrl: string): string {
  const url = new URL(siteUrl);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new TypeError("An HTTPS site URL is required");
  }
  const base = url.origin;
  return `YOHAKUで即興TRPGを遊びたいです。以下はAIへの指示なので、プレイ中に読み上げず、必要な取得が成功してから始めてください。

希望がなければ「静かに話す」「冒険する」「笑える」など異なる体験を2〜3件だけ、何をする遊びかと一緒に紹介してください。好みの確認は必要なときに1問まで。「おまかせ」「何も知らずに」なら確認を挟まず一作を選びます。ホラーは希望されたときだけ候補にし、避けたい題材を優先してください。全作品を一度に列挙しないでください。

接続済みのMCP / Site Toolsが使える場合はsearch_storiesで検索し、作品決定後にget_storyで本文を取得します。利用できない場合は、まず次の互換Catalogを一度取得してください。おすすめの一部のworldとinitial_state、共通gm_guideが含まれます。
${base}/api/compat/stories

希望に合う候補がなければ、次の選前一覧を参照してください。紹介にはtitle・summary・selection_hint・tagsだけを使い、選択後に一覧内のstory_urlを取得します。
${base}/api/stories

まだ使える本文がない場合は、取得失敗を短く伝え、同じ取得を繰り返したり作品を創作して代用したりせず止まってください。技術用語で長く説明しないでください。

取得したgm_guideに従い、安全案内と最小の遊び方案内を一度だけ行い、すぐ場面描写へ移ってください。「原本どおり」「世界を固める」「一度決まったことは変えない」など内部運用の宣言は不要です。情報はGMが提示し、私が行動を決めます。`;
}

export type ClipboardPort = { writeText(text: string): Promise<void> };
export type CopyResult = "copied" | "manual";
export async function copyText(text: string, clipboard?: ClipboardPort): Promise<CopyResult> {
  if (!clipboard) return "manual";
  try { await clipboard.writeText(text); return "copied"; }
  catch { return "manual"; }
}

export type SharePort = (data: { title: string; url: string }) => Promise<void>;
export type ShareResult = "shared" | "cancelled" | CopyResult;
export async function shareSite(title: string, url: string, share?: SharePort, clipboard?: ClipboardPort): Promise<ShareResult> {
  if (share) {
    try { await share({ title, url }); return "shared"; }
    catch (error) {
      if (error && typeof error === "object" && "name" in error && error.name === "AbortError") return "cancelled";
    }
  }
  return copyText(url, clipboard);
}
