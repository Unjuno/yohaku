import { NextResponse } from "next/server";
import { getStory } from "@/lib/stories";
import { SITE_CONFIG } from "@/lib/config";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const story = getStory(id);
  if (!story) {
    return NextResponse.json(
      { error: "story_not_found", message: `作品ID「${id}」は見つかりません。` },
      { status: 404 },
    );
  }
  return NextResponse.json({
    id: story.id,
    title: story.title,
    story_url: `${SITE_CONFIG.siteUrl}/api/stories/${encodeURIComponent(story.id)}`,
    world: story.world,
    initial_state: story.initial_state,
    gm_guide: story.gm_guide,
  });
}

export async function POST() {
  return NextResponse.json({ error: "read_only", message: "作品の書き込みは公開されていません。" }, { status: 405, headers: { Allow: "GET" } });
}
