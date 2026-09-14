import { catalogResponse, readOnlyResponse } from "@/lib/story-http";

export function GET(request: Request) {
  return catalogResponse(request, true);
}
export const POST = readOnlyResponse;
