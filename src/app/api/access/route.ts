import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  COOKIE_OPTS,
  accessCookieValue,
  verifyAccessCode,
} from "@/lib/usage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { code?: string };
  if (!verifyAccessCode(String(body.code ?? ""))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, accessCookieValue(), COOKIE_OPTS);
  return res;
}
