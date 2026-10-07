import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createStudy, runGeneration } from "@/lib/pipeline";
import { getStudy, getUsageCount, setUsageCount } from "@/lib/studies";
import {
  ACCESS_COOKIE,
  COOKIE_OPTS,
  VISITOR_COOKIE,
  accessCookieOk,
  freeLimit,
  newVisitorId,
} from "@/lib/usage";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const source = await getStudy(id);
  if (!source) return NextResponse.json({ error: "Study not found" }, { status: 404 });

  // Regenerate spends an image like a fresh study - same free-tier gate.
  const jar = await cookies();
  const vid = jar.get(VISITOR_COOKIE)?.value ?? newVisitorId();
  const granted = accessCookieOk(jar.get(ACCESS_COOKIE)?.value);
  let used = 0;
  if (!granted) {
    used = await getUsageCount(vid);
    if (used >= freeLimit()) {
      const r = NextResponse.json(
        { error: "free_limit", free_limit: freeLimit() },
        { status: 403 },
      );
      r.cookies.set(VISITOR_COOKIE, vid, COOKIE_OPTS);
      return r;
    }
  }

  const study = await createStudy(source.garment_template, source.selected_colours, source.study_id);
  await runGeneration(study.study_id);
  const final = await getStudy(study.study_id);
  const status = final?.status ?? "failed";
  if (!granted && status === "ready") {
    used += 1;
    await setUsageCount(vid, used);
  }
  const res = NextResponse.json(
    {
      study_id: study.study_id,
      status,
      error: final?.error ?? null,
      free_remaining: granted ? null : Math.max(0, freeLimit() - used),
    },
    { status: status === "ready" ? 201 : 502 },
  );
  res.cookies.set(VISITOR_COOKIE, vid, COOKIE_OPTS);
  return res;
}
