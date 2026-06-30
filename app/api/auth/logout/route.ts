import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/cookies";
import { clearTokensOnResponse } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearTokensOnResponse(response);
}
