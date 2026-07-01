import { NextRequest, NextResponse } from "next/server";
import { getAppUrlFromRequest, redirectToAppPath } from "@/lib/app-url";
import { createOAuthState } from "@/lib/oauth-state";
import { getLoginUrl, hasSpotifyConfig } from "@/lib/spotify";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!hasSpotifyConfig()) {
    return NextResponse.redirect(
      redirectToAppPath(request, "/?error=config_error"),
    );
  }

  try {
    const appUrl = getAppUrlFromRequest(request);
    const state = createOAuthState();
    const response = NextResponse.redirect(getLoginUrl(state, appUrl));

    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch {
    return NextResponse.redirect(
      redirectToAppPath(request, "/?error=config_error"),
    );
  }
}
