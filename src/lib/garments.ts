import fs from "node:fs";
import path from "node:path";
import type { GarmentTemplate } from "./types";

const GARMENTS_DIR = path.join(process.cwd(), "data", "garments");

let cache: GarmentTemplate[] | null = null;

export function listGarments(): GarmentTemplate[] {
  if (!cache) {
    cache = fs
      .readdirSync(GARMENTS_DIR)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => JSON.parse(fs.readFileSync(path.join(GARMENTS_DIR, f), "utf8")) as GarmentTemplate);
  }
  return cache;
}

export function getGarment(id: string): GarmentTemplate | null {
  return listGarments().find((g) => g.id === id) ?? null;
}
