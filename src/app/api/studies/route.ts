import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      garment_id?: string;
      colour_ids?: string[];
    };
    const garmentId = body.garment_id;
    const colourIds = body.colour_ids;
    if (!garmentId || !Array.isArray(colourIds) || colourIds.length < 1 || colourIds.length > 3) {
      return NextResponse.json(
        { error: "Provide garment_id and 1-3 colour_ids" },
        { status: 400 },
      );
    }

    // Free-tier gate: visitors get N generations, then need an access code.
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

    const study = await createStudy(garmentId, colourIds);
    // Awaited inline: generations are short (~15-110s by quality tier) and the
    // request must carry the work on serverless, where detached promises die.
    // Stages still persist on the study record for audit/debugging.
    await runGeneration(study.study_id);
    const final = await getStudy(study.study_id);
    const status = final?.status ?? "failed";
    // Only successful generations consume a free credit.
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
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create study" },
      { status: 400 },
    );
  }
}
