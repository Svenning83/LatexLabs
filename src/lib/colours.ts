import fs from "node:fs";
import path from "node:path";
import type { ColourDatabase, ColourRecord } from "./types";

const COLOURS_DIR = path.join(process.cwd(), "data", "colours");

let dbs: ColourDatabase[] | null = null;

function loadDbs(): ColourDatabase[] {
  if (!dbs) {
    dbs = fs
      .readdirSync(COLOURS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(COLOURS_DIR, f), "utf8")) as ColourDatabase);
  }
  return dbs;
}

/** All colours across all manufacturers (MVP: Libidex only). */
export function listColours(manufacturer?: string): ColourRecord[] {
  return loadDbs()
    .filter((db) => !manufacturer || db.manufacturer === manufacturer)
    .flatMap((db) => db.colours);
}

export function getColour(id: string): ColourRecord | null {
  return listColours().find((c) => c.id === id) ?? null;
}

export function getColours(ids: string[]): ColourRecord[] {
  const all = listColours();
  return ids
    .map((id) => all.find((c) => c.id === id))
    .filter((c): c is ColourRecord => Boolean(c));
}

export function listManufacturers(): ColourDatabase[] {
  return loadDbs();
}

export function listCategories(manufacturer?: string): string[] {
  const cats = new Set(listColours(manufacturer).filter((c) => c.active).map((c) => c.category));
  return [...cats];
}
