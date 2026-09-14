import {
  DEFAULT_SEARCH_LIMIT, GET_DESCRIPTION, GET_INPUT_SCHEMA, SEARCH_DESCRIPTION,
  SEARCH_INPUT_SCHEMA, validateSearchInput, type SearchResult, type StoryDetail,
} from "./story-contract";

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;
export type WebTool = {
  name: string; description: string; inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>, options?: { signal?: AbortSignal }) => Promise<unknown>;
};
export type WebModelContext = {
  registerTool: (tool: WebTool, options?: { signal?: AbortSignal }) => Promise<void> | void;
};
export type WebMcpStatus = "checking" | "ready" | "unavailable";

export class ToolRequestError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) {
    super(message); this.name = "ToolRequestError";
  }
}
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

async function readJson(url: string, fetcher: Fetcher, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try { response = await fetcher(url, { signal }); }
  catch (error) {
    if (signal?.aborted) throw error;
    throw new ToolRequestError("network_error", "作品データの通信に失敗しました。作品0件という意味ではありません。");
  }
  if (!response.ok) {
    throw new ToolRequestError("http_error", `作品APIの取得に失敗しました（HTTP ${response.status}）。`, response.status);
  }
  try { return await response.json(); }
  catch { throw new ToolRequestError("invalid_response", "作品APIから正常なJSONを取得できませんでした。"); }
}

function searchResult(value: unknown): SearchResult {
  if (!object(value) || !Array.isArray(value.stories) || !Number.isInteger(value.count) || value.count !== value.stories.length) {
    throw new ToolRequestError("invalid_response", "検索結果の形式が不正です。");
  }
  const stories = value.stories.map((item: unknown) => {
    if (!object(item) || !text(item.id) || !text(item.title) || !text(item.selection_hint) || !text(item.summary) ||
        !Array.isArray(item.tags) || !item.tags.every((tag: unknown) => typeof tag === "string")) {
      throw new ToolRequestError("invalid_response", "検索候補に必要な情報がありません。");
    }
    // Never forward a body accidentally returned by a faulty Catalog endpoint.
    return { id: item.id, title: item.title, selection_hint: item.selection_hint, summary: item.summary, tags: item.tags as string[] };
  });
  return { stories, count: stories.length };
}

export function createWebTools(fetcher: Fetcher = fetch, lifetime?: AbortSignal): WebTool[] {
  const signalFor = (signal?: AbortSignal) => lifetime && signal ? AbortSignal.any([lifetime, signal]) : lifetime ?? signal;
  return [
    {
      name: "search_stories", description: SEARCH_DESCRIPTION, inputSchema: SEARCH_INPUT_SCHEMA,
      execute: async (raw, options) => {
        const input = validateSearchInput(raw);
        const params = new URLSearchParams({ query: input.query ?? "", limit: String(input.limit ?? DEFAULT_SEARCH_LIMIT) });
        input.tags?.forEach((tag) => params.append("tag", tag));
        input.exclude_tags?.forEach((tag) => params.append("exclude_tag", tag));
        return searchResult(await readJson(`/api/stories?${params}`, fetcher, signalFor(options?.signal)));
      },
    },
    {
      name: "get_story", description: GET_DESCRIPTION, inputSchema: GET_INPUT_SCHEMA,
      execute: async (input, options): Promise<StoryDetail> => {
        if (!text(input.id)) throw new ToolRequestError("invalid_input", "作品IDを指定してください。");
        const value = await readJson(`/api/stories/${encodeURIComponent(input.id)}`, fetcher, signalFor(options?.signal));
        if (!object(value) || value.id !== input.id || !text(value.title) || !text(value.world) || !text(value.initial_state) || !text(value.gm_guide)) {
          throw new ToolRequestError("invalid_response", "取得した作品に必要な情報がありません。");
        }
        return { id: input.id, title: value.title, world: value.world, initial_state: value.initial_state, gm_guide: value.gm_guide };
      },
    },
  ];
}

/** Sept 2026 draft: document.modelContext, Promise registration, signal-owned cleanup. */
export function startWebMcp(context: WebModelContext | undefined, report: (status: WebMcpStatus) => void, fetcher: Fetcher = fetch): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  let disposed = false;
  const stop = () => { disposed = true; controller.abort(); };
  void (async () => {
    try {
      if (!context) { if (!disposed) report("unavailable"); return; }
      for (const tool of createWebTools(fetcher, signal)) {
        if (disposed) return;
        await context.registerTool(tool, { signal });
      }
      if (!disposed) report("ready");
    } catch {
      // Roll back a partially registered pair. Do not publish ready on async rejection.
      controller.abort();
      if (!disposed) report("unavailable");
    }
  })();
  return stop;
}
