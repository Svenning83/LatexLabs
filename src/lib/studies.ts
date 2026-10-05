import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Study } from "./types";

const STUDIES_DIR = path.join(process.cwd(), "data", "studies");

function ensureDir() {
  fs.mkdirSync(STUDIES_DIR, { recursive: true });
}

function studyPath(id: string): string {
  return path.join(STUDIES_DIR, `${id}.json`);
}

export function imagePathFor(id: string): string {
  return path.join(STUDIES_DIR, `${id}.png`);
}

export function createStudyId(): string {
  ensureDir();
  for (let i = 0; i < 24; i++) {
    const id = crypto.randomBytes(3).toString("hex"); // e.g. "8f3a21"
    if (!fs.existsSync(studyPath(id))) return id;
  }
  return crypto.randomBytes(6).toString("hex");
}

export function saveStudy(study: Study): void {
  ensureDir();
  fs.writeFileSync(studyPath(study.study_id), JSON.stringify(study, null, 2));
}

export function getStudy(id: string): Study | null {
  const p = studyPath(id);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as Study;
  } catch {
    return null;
  }
}
