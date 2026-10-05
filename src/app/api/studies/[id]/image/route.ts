import fs from "node:fs";
import { NextResponse } from "next/server";
import { getStudy, imagePathFor } from "@/lib/studies";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const study = getStudy(id);
  const p = imagePathFor(id);
  if (!study || !fs.existsSync(p)) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
  const buf = fs.readFileSync(p);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
