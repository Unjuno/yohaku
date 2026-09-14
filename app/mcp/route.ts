import { createMcpHandler, McpServer, originValidationResponse } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { getStory, searchStories } from "@/lib/stories";

const handler = createMcpHandler(
  () => {
    const server = new McpServer({ name: "yohaku", version: "1.0.0" });

    server.registerTool(
      "search_stories",
      {
        description:
          "利用者の好みに合う公開作品を探すときに呼ぶ。id・title・ネタバレなしのselection_hint・summary・tagsだけを返し、worldなどの本文や架空の作品は返さない。開始や状態保存、作品変更は行わない。",
        inputSchema: z.object({
          query: z.string().default("").describe("好みや雰囲気を表す検索語"),
          tags: z.array(z.string()).optional().describe("すべて一致させる任意タグ"),
          exclude_tags: z.array(z.string()).optional().describe("除外する任意タグ"),
          limit: z.number().int().min(1).max(20).default(3).describe("候補件数。1〜20"),
        }),
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      },
      async (input) => {
        const stories = searchStories(input);
        const result = stories.length
          ? { stories, count: stories.length }
          : { stories: [], count: 0, message: "一致する作品はありません。存在しない作品は補いません。" };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], structuredContent: result };
      },
    );

    server.registerTool(
      "get_story",
      {
        description:
          "利用者が選んだ作品の開始設定を取得または再参照するときに呼ぶ。保存済みのworld・initial_stateと短い共通GMガイドを原文のまま一度に返す。チャット作成、Live起動、プレイ状態保存、作品変更は行わない。",
        inputSchema: z.object({ id: z.string().min(1).describe("search_stories が返した作品ID") }),
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      },
      async ({ id }) => {
        const story = getStory(id);
        if (!story) {
          const error = { error: "story_not_found", message: `作品ID「${id}」は見つかりません。` };
          return { content: [{ type: "text", text: JSON.stringify(error, null, 2) }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(story, null, 2) }], structuredContent: story };
      },
    );
    return server;
  },
  { responseMode: "json" },
);

export async function POST(request: Request) {
  const hostname = new URL(request.url).hostname;
  const rejected = originValidationResponse(request, [hostname]);
  if (rejected) return rejected;
  return handler.fetch(request);
}

export function GET() {
  return new Response("MCP endpoint. Use Streamable HTTP POST.", { status: 405, headers: { Allow: "POST" } });
}
