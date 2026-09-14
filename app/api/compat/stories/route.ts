import { NextRequest, NextResponse } from "next/server";
import { getFallbackCatalogStories, PLAY_STORIES } from "@/lib/stories";
import { SITE_CONFIG } from "@/lib/config";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("query") ?? params.get("q") ?? "";
  const rawLimit = params.get("limit");
  const limit = rawLimit === null ? PLAY_STORIES.length : Number(rawLimit);
  try {
    const stories = getFallbackCatalogStories({
      query,
      tags: params.getAll("tag"),
      exclude_tags: params.getAll("exclude_tag"),
      limit,
    }).map((story) => ({ ...story, story_url: `${SITE_CONFIG.siteUrl}/api/stories/${encodeURIComponent(story.id)}` }));
    return NextResponse.json({ compatibility_mode: "single_fetch", stories, count: stories.length });
  } catch {
    return NextResponse.json({ error: "invalid_limit", message: "limitは1〜20の整数で指定してください。" }, { status: 400 });
  }
}

export async function POST() {
  return NextResponse.json({ error: "read_only" }, { status: 405, headers: { Allow: "GET" } });
}
