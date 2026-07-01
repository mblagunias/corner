import { NextRequest, NextResponse } from "next/server";
import { parseMonthQuery } from "@/lib/month-range";
import { getTopAlbumsForMonth } from "@/lib/spotify";
import { getValidAccessToken } from "@/lib/session";

export async function GET(request: NextRequest) {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const parsed = parseMonthQuery(
    searchParams.get("year"),
    searchParams.get("month"),
  );

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const data = await getTopAlbumsForMonth(
      accessToken,
      parsed.year,
      parsed.month,
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch albums from Spotify" },
      { status: 500 },
    );
  }
}
