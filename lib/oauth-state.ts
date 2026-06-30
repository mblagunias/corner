import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const STATE_TTL_MS = 10 * 60 * 1000;

function getStateSecret() {
  const secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!secret) {
    throw new Error("Missing Spotify credentials");
  }

  return secret;
}

function signPayload(payloadB64: string) {
  return createHmac("sha256", getStateSecret())
    .update(payloadB64)
    .digest("base64url");
}

export function createOAuthState() {
  const payload = JSON.stringify({
    nonce: randomBytes(16).toString("hex"),
    ts: Date.now(),
  });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

export function verifyOAuthState(state: string | null): boolean {
  if (!state) {
    return false;
  }

  const separator = state.lastIndexOf(".");
  if (separator <= 0) {
    return false;
  }

  const payloadB64 = state.slice(0, separator);
  const signature = state.slice(separator + 1);
  const expected = signPayload(payloadB64);

  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return false;
    }
  } catch {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as { ts?: number };

    if (typeof payload.ts !== "number") {
      return false;
    }

    return Date.now() - payload.ts <= STATE_TTL_MS;
  } catch {
    return false;
  }
}
