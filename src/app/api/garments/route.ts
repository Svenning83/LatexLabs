import { NextResponse } from "next/server";
import { listGarments } from "@/lib/garments";

export const runtime = "nodejs";

export async function GET() {
  const garments = listGarments().map((g) => ({
    id: g.id,
    code: g.code,
    name: g.name,
    title: g.title,
    display_name: g.display_name,
    descriptor: g.descriptor,
    card_image: g.card_image,
    tagline: g.tagline,
    construction: g.construction,
    master_image_url: `/references/${g.master_reference.split(/[\\/]/).pop()}`,
  }));
  return NextResponse.json({ garments });
}
