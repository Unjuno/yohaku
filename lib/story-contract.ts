/** Shared transport contract. This module must not import story bodies. */
export const DEFAULT_SEARCH_LIMIT = 3;
export const MAX_SEARCH_LIMIT = 20;
export const SEARCH_DESCRIPTION = "好みに合う配信作品を探す。id、title、selection_hint、summary、tagsとcountだけを返す。本文やプレイ状態は返さない。";
export const GET_DESCRIPTION = "選択済み作品のworld、initial_state、共通GMガイドを取得・再参照する。チャット作成や状態保存はしない。";
export const SEARCH_INPUT_SCHEMA = {
  type: "object", additionalProperties: false,
  properties: {
    query: { type: "string", default: "", description: "好みや雰囲気を表す検索語" },
    tags: { type: "array", items: { type: "string" }, description: "すべて一致させる任意タグ" },
    exclude_tags: { type: "array", items: { type: "string" }, description: "除外する任意タグ" },
    limit: { type: "integer", minimum: 1, maximum: MAX_SEARCH_LIMIT, default: DEFAULT_SEARCH_LIMIT },
  },
} as const;
export const GET_INPUT_SCHEMA = {
  type: "object", additionalProperties: false,
  properties: { id: { type: "string", minLength: 1, description: "検索結果の作品ID" } },
  required: ["id"],
} as const;

export type SearchInput = { query?: string; tags?: string[]; exclude_tags?: string[]; limit?: number };
export type StorySummary = { id: string; title: string; selection_hint: string; summary: string; tags: string[] };
export type StoryDetail = { id: string; title: string; world: string; initial_state: string; gm_guide: string };
export type SearchResult = { stories: StorySummary[]; count: number };

export class InvalidSearchInput extends Error {
  constructor(public readonly code: "invalid_limit" | "invalid_input", message: string) {
    super(message); this.name = "InvalidSearchInput";
  }
}

export function validateSearchInput(input: unknown): SearchInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new InvalidSearchInput("invalid_input", "検索条件はオブジェクトで指定してください。");
  }
  const value = input as Record<string, unknown>;
  if (value.query !== undefined && typeof value.query !== "string") {
    throw new InvalidSearchInput("invalid_input", "queryは文字列で指定してください。");
  }
  for (const name of ["tags", "exclude_tags"] as const) {
    if (value[name] !== undefined && (!Array.isArray(value[name]) || !value[name].every((item: unknown) => typeof item === "string"))) {
      throw new InvalidSearchInput("invalid_input", `${name}は文字列の配列で指定してください。`);
    }
  }
  if (value.limit !== undefined && (typeof value.limit !== "number" || !Number.isInteger(value.limit) || value.limit < 1 || value.limit > MAX_SEARCH_LIMIT)) {
    throw new InvalidSearchInput("invalid_limit", `limitは1〜${MAX_SEARCH_LIMIT}の整数で指定してください。`);
  }
  return {
    query: value.query as string | undefined,
    tags: value.tags as string[] | undefined,
    exclude_tags: value.exclude_tags as string[] | undefined,
    limit: value.limit as number | undefined,
  };
}

/** Omitted limit means full lightweight Catalog; not PLAY_STORIES.length as a search limit. */
export function parseSearchParams(params: URLSearchParams): SearchInput {
  const raw = params.get("limit");
  if (raw !== null && !/^[1-9][0-9]*$/.test(raw)) {
    throw new InvalidSearchInput("invalid_limit", `limitは1〜${MAX_SEARCH_LIMIT}の整数で指定してください。`);
  }
  return validateSearchInput({
    query: params.get("query") ?? params.get("q") ?? "",
    tags: params.getAll("tag"), exclude_tags: params.getAll("exclude_tag"),
    limit: raw === null ? undefined : Number(raw),
  });
}
