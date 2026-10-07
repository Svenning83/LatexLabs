import crypto from "node:crypto";

export const VISITOR_COOKIE = "ll_vid";
export const ACCESS_COOKIE = "ll_access";

export const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  secure: process.env.NODE_ENV === "production",
};

export function freeLimit(): number {
  const n = parseInt(process.env.LATEXLABS_FREE_LIMIT ?? "3", 10);
  return Number.isFinite(n) && n >= 0 ? n : 3;
}

export function newVisitorId(): string {
  return crypto.randomUUID();
}

export function verifyAccessCode(code: string): boolean {
  const codes = (process.env.LATEXLABS_ACCESS_CODES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return code.trim().length > 0 && codes.includes(code.trim());
}

function accessSecret(): string {
  return (
    process.env.LATEXLABS_ACCESS_SECRET ||
    process.env.OPENAI_API_KEY ||
    "latexlabs-dev-secret"
  );
}

export function accessCookieValue(): string {
  return crypto
    .createHmac("sha256", accessSecret())
    .update("latexlabs-access")
    .digest("hex");
}

export function accessCookieOk(value: string | undefined): boolean {
  const expected = accessCookieValue();
  if (!value || value.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
