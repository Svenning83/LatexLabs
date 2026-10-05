import { NextRequest, NextResponse } from "next/server";
import { createStudy, runGeneration } from "@/lib/pipeline";

export const runtime = "nodejs";

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
    const study = createStudy(garmentId, colourIds);
    // Fire-and-forget: the pipeline persists each stage on the study record,
    // and clients poll GET /api/studies/[id] for progress.
    void runGeneration(study.study_id);
    return NextResponse.json({ study_id: study.study_id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create study" },
      { status: 400 },
    );
  }
}
