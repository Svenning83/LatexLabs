import { NextResponse } from "next/server";
import { getStudy } from "@/lib/studies";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const study = await getStudy(id);
  if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 });
  return NextResponse.json({ study });
}
