import { NextResponse } from "next/server";
import { createStudy, runGeneration } from "@/lib/pipeline";
import { getStudy } from "@/lib/studies";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const source = await getStudy(id);
  if (!source) return NextResponse.json({ error: "Study not found" }, { status: 404 });
  const study = await createStudy(source.garment_template, source.selected_colours, source.study_id);
  await runGeneration(study.study_id);
  const final = await getStudy(study.study_id);
  const status = final?.status ?? "failed";
  return NextResponse.json(
    { study_id: study.study_id, status, error: final?.error ?? null },
    { status: status === "ready" ? 201 : 502 },
  );
}
