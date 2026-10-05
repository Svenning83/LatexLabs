import { NextResponse } from "next/server";
import { listCategories, listColours, listManufacturers } from "@/lib/colours";

export const runtime = "nodejs";

export async function GET() {
  const manufacturer = listManufacturers()[0]?.manufacturer ?? null;
  const colours = listColours(manufacturer ?? undefined).filter((c) => c.active);
  return NextResponse.json({
    manufacturer,
    categories: listCategories(manufacturer ?? undefined),
    colours,
  });
}
