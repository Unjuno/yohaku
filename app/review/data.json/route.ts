import { NextResponse } from "next/server";
import { REVIEW_DATA } from "@/lib/review-data";

export async function GET() {
  return NextResponse.json(REVIEW_DATA, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=300", "X-Robots-Tag": "noindex, nofollow" },
  });
}

export async function POST() {
  return NextResponse.json(
    { error: "read_only", message: "レビュー画面から作品を変更することはできません。" },
    { status: 405, headers: { Allow: "GET" } },
  );
}
