import { NextResponse } from "next/server";
import { getTopAlbumsFromPreviousMonth } from "@/lib/spotify";
import { getValidAccessToken } from "@/lib/session";

export async function GET() {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getTopAlbumsFromPreviousMonth(accessToken);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch albums from Spotify" },
      { status: 500 },
    );
  }
}
