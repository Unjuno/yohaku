import { NextRequest, NextResponse } from "next/server";
import { PLAY_STORIES, searchStories } from "@/lib/stories";
import { SITE_CONFIG } from "@/lib/config";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tags = params.getAll("tag");
  const excludeTags = params.getAll("exclude_tag");
  const query = params.get("query") ?? params.get("q") ?? "";
  const rawLimit = params.get("limit");
  const limit = rawLimit === null ? PLAY_STORIES.length : Number(rawLimit);
  let stories;
  try {
    stories = searchStories({ query, tags, exclude_tags: excludeTags, limit });
  } catch {
    return NextResponse.json({ error: "invalid_limit", message: "limitは1〜20の整数で指定してください。" }, { status: 400 });
  }
  const catalogStories = stories.map((story) => ({
    ...story,
    selection_hint: PLAY_STORIES.find((item) => item.id === story.id)?.selection_hint ?? "",
    story_url: `${SITE_CONFIG.siteUrl}/api/stories/${encodeURIComponent(story.id)}`,
  }));
  return NextResponse.json({
    catalog_url: `${SITE_CONFIG.siteUrl}/api/stories`,
    catalog_mode: "selection_only",
    stories: catalogStories,
    count: catalogStories.length,
  });
}

export async function POST() {
  return NextResponse.json({ error: "read_only", message: "作品の書き込みは公開されていません。" }, { status: 405, headers: { Allow: "GET" } });
}
