import { NextRequest, NextResponse } from "next/server";
import { getAppUrlFromRequest } from "@/lib/app-url";
import { createOAuthState } from "@/lib/oauth-state";
import { getLoginUrl } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  try {
    const appUrl = getAppUrlFromRequest(request);
    const state = createOAuthState();
    const response = NextResponse.redirect(getLoginUrl(state, appUrl));

    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/?error=config_error", getAppUrlFromRequest(request)),
    );
  }
}
