import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE, tokenCookieOptions } from "@/lib/cookies";
import { verifyOAuthState } from "@/lib/oauth-state";
import { exchangeCodeForTokens } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/?error=access_denied", request.url),
    );
  }

  if (!code || !verifyOAuthState(state)) {
    return NextResponse.redirect(
      new URL("/?error=invalid_state", request.url),
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const response = NextResponse.redirect(new URL("/", request.url));

    response.cookies.set(
      TOKEN_COOKIE,
      JSON.stringify(tokens),
      tokenCookieOptions,
    );

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/?error=auth_failed", request.url),
    );
  }
}
