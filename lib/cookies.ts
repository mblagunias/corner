import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const TOKEN_COOKIE = "spotify_tokens";

const isProduction = process.env.NODE_ENV === "production";

export const tokenCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};
