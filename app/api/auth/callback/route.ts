import { NextRequest, NextResponse } from "next/server";
import { getAppUrlFromRequest, redirectToAppPath } from "@/lib/app-url";
import { TOKEN_COOKIE, tokenCookieOptions } from "@/lib/cookies";
import { verifyOAuthState } from "@/lib/oauth-state";
import { exchangeCodeForTokens, hasSpotifyConfig } from "@/lib/spotify";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!hasSpotifyConfig()) {
    return NextResponse.redirect(
      redirectToAppPath(request, "/?error=config_error"),
    );
  }

  const appUrl = getAppUrlFromRequest(request);
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/?error=access_denied", appUrl),
    );
  }

  if (!code || !verifyOAuthState(state)) {
    return NextResponse.redirect(
      new URL("/?error=invalid_state", appUrl),
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code, appUrl);
    const response = NextResponse.redirect(new URL("/", appUrl));

    response.cookies.set(
      TOKEN_COOKIE,
      JSON.stringify(tokens),
      tokenCookieOptions,
    );

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/?error=auth_failed", appUrl),
    );
  }
}
