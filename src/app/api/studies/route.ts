import { NextRequest, NextResponse } from "next/server";
import { createStudy, runGeneration } from "@/lib/pipeline";
import { getStudy } from "@/lib/studies";

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
    const study = await createStudy(garmentId, colourIds);
    // Awaited inline: generations are short (~15-110s by quality tier) and the
    // request must carry the work on serverless, where detached promises die.
    // Stages still persist on the study record for audit/debugging.
    await runGeneration(study.study_id);
    const final = await getStudy(study.study_id);
    const status = final?.status ?? "failed";
    return NextResponse.json(
      { study_id: study.study_id, status, error: final?.error ?? null },
      { status: status === "ready" ? 201 : 502 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create study" },
      { status: 400 },
    );
  }
}
