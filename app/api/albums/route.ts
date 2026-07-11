import { NextRequest, NextResponse } from "next/server";
import { getTopAlbumsForTimeRange } from "@/lib/spotify";
import { getValidAccessToken } from "@/lib/session";
import { parseTimeRangeQuery } from "@/lib/time-range";

export async function GET(request: NextRequest) {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = parseTimeRangeQuery(request.nextUrl.searchParams.get("time_range"));

  if (typeof parsed === "object") {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const data = await getTopAlbumsForTimeRange(accessToken, parsed);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch albums from Spotify" },
      { status: 500 },
    );
  }
}
