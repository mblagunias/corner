import { NextResponse } from "next/server";
import { createOAuthState } from "@/lib/oauth-state";
import { getLoginUrl } from "@/lib/spotify";

export async function GET() {
  const state = createOAuthState();
  return NextResponse.redirect(getLoginUrl(state));
}
