import { NextResponse } from "next/server";
import { createStudy, runGeneration } from "@/lib/pipeline";
import { getStudy } from "@/lib/studies";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const source = getStudy(id);
  if (!source) return NextResponse.json({ error: "Study not found" }, { status: 404 });
  const study = createStudy(source.garment_template, source.selected_colours, source.study_id);
  void runGeneration(study.study_id);
  return NextResponse.json({ study_id: study.study_id }, { status: 201 });
}
