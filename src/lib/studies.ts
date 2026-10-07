import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { head, put } from "@vercel/blob";
import type { Study } from "./types";

const STUDIES_DIR = path.join(process.cwd(), "data", "studies");
const USAGE_DIR = path.join(process.cwd(), "data", "usage");

// Studies persist to Vercel Blob when BLOB_READ_WRITE_TOKEN is present
// (serverless filesystems are ephemeral); otherwise local disk for dev.
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function ensureDir() {
  fs.mkdirSync(STUDIES_DIR, { recursive: true });
}

const studyKey = (id: string) => `studies/${id}.json`;
const imageKey = (id: string) => `studies/${id}.png`;

function studyPath(id: string): string {
  return path.join(STUDIES_DIR, `${id}.json`);
}

/** Where providers write the PNG before it is persisted to the study store. */
export function imagePathFor(id: string): string {
  return useBlob()
    ? path.join(os.tmpdir(), `ll-study-${id}.png`)
    : path.join(STUDIES_DIR, `${id}.png`);
}

export function createStudyId(): string {
  // Blob mode can't do a cheap existence check; 3 bytes is 16M ids - fine.
  if (useBlob()) return crypto.randomBytes(3).toString("hex");
  ensureDir();
  for (let i = 0; i < 24; i++) {
    const id = crypto.randomBytes(3).toString("hex");
    if (!fs.existsSync(studyPath(id))) return id;
  }
  return crypto.randomBytes(6).toString("hex");
}

export async function saveStudy(study: Study): Promise<void> {
  if (useBlob()) {
    await put(studyKey(study.study_id), JSON.stringify(study, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }
  ensureDir();
  fs.writeFileSync(studyPath(study.study_id), JSON.stringify(study, null, 2));
}

export async function getStudy(id: string): Promise<Study | null> {
  if (useBlob()) {
    try {
      const meta = await head(studyKey(id));
      // Cache-bust: blob URLs are CDN-cached, and the study JSON is rewritten
      // through the pipeline stages on the same pathname.
      const res = await fetch(`${meta.url}?v=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      return (await res.json()) as Study;
    } catch {
      return null;
    }
  }
  const p = studyPath(id);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as Study;
  } catch {
    return null;
  }
}

const usageKey = (id: string) => `usage/${id}.json`;

/** Free-generation counter per visitor cookie id (same dual-mode store). */
export async function getUsageCount(visitorId: string): Promise<number> {
  if (useBlob()) {
    try {
      const meta = await head(usageKey(visitorId));
      const res = await fetch(`${meta.url}?v=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return 0;
      const j = (await res.json()) as { count?: number };
      return typeof j.count === "number" ? j.count : 0;
    } catch {
      return 0;
    }
  }
  const p = path.join(USAGE_DIR, `${visitorId}.json`);
  if (!fs.existsSync(p)) return 0;
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8")) as { count?: number };
    return typeof j.count === "number" ? j.count : 0;
  } catch {
    return 0;
  }
}

export async function setUsageCount(
  visitorId: string,
  count: number,
): Promise<void> {
  const body = JSON.stringify({ count });
  if (useBlob()) {
    await put(usageKey(visitorId), body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }
  fs.mkdirSync(USAGE_DIR, { recursive: true });
  fs.writeFileSync(path.join(USAGE_DIR, `${visitorId}.json`), body);
}

/**
 * Move the provider's PNG output into the study store and return the value
 * to store on study.generated_image (a blob URL, or the local relative path).
 */
export async function persistStudyImage(id: string): Promise<string> {
  const tmp = imagePathFor(id);
  if (useBlob()) {
    const blob = await put(imageKey(id), fs.readFileSync(tmp), {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    try {
      fs.unlinkSync(tmp);
    } catch {}
    return blob.url;
  }
  return `data/studies/${id}.png`;
}
