import type { ImageProvider } from "../types";
import { geminiProvider } from "./gemini";
import { mockProvider } from "./mock";
import { openaiProvider } from "./openai";

export function getProvider(): ImageProvider {
  const pref = (process.env.LATEXLABS_IMAGE_PROVIDER || "").toLowerCase();
  if (pref === "gemini") return geminiProvider;
  if (pref === "openai") return openaiProvider;
  if (pref === "mock") return mockProvider;
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) return geminiProvider;
  if (process.env.OPENAI_API_KEY) return openaiProvider;
  return mockProvider;
}
