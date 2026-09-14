import { GM_GUIDE, SITE_CONFIG } from "./config";
import { getFallbackCatalogStories, listStories, PLAY_STORIES } from "./stories";
import { InvalidSearchInput, parseSearchParams } from "./story-contract";

export function catalogResponse(request: Request, compatibility = false): Response {
  try {
    const input = parseSearchParams(new URL(request.url).searchParams);
    const selected = compatibility ? getFallbackCatalogStories(input) : listStories(input);
    const stories = selected.map((story) => ({
      ...story, story_url: `${SITE_CONFIG.siteUrl}/api/stories/${encodeURIComponent(story.id)}`,
    }));
    const catalog_url = `${SITE_CONFIG.siteUrl}/api/stories`;
    return Response.json(compatibility
      ? { compatibility_mode: "single_fetch", selection_scope: "recommended_subset", catalog_url,
          total_available: PLAY_STORIES.length, gm_guide: GM_GUIDE, stories, count: stories.length }
      : { catalog_url, catalog_mode: "selection_only", stories, count: stories.length });
  } catch (error) {
    if (!(error instanceof InvalidSearchInput)) throw error;
    return Response.json({ error: error.code, message: error.message }, { status: 400 });
  }
}

export function readOnlyResponse(): Response {
  return Response.json({ error: "read_only", message: "作品の書き込みは公開されていません。" }, {
    status: 405, headers: { Allow: "GET" },
  });
}
