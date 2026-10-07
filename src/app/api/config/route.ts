import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Roughly-calibrated end-to-end generation times (seconds) per quality tier,
// from measured runs (includes ~1.5s of pipeline overhead).
const EXPECTED: Record<string, number> = {
  low: 20,
  medium: 45,
  high: 110,
  auto: 60,
};

export function GET() {
  const pref = (process.env.LATEXLABS_IMAGE_PROVIDER || "").toLowerCase();
  const provider =
    pref ||
    (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
      ? "gemini"
      : process.env.OPENAI_API_KEY
        ? "openai"
        : "mock");
  const model =
    provider === "openai"
      ? process.env.LATEXLABS_OPENAI_MODEL || "gpt-image-2.5-sunburst"
      : provider === "gemini"
        ? process.env.LATEXLABS_GEMINI_MODEL || "gemini-2.5-flash-image"
        : "mock";
  const quality = process.env.LATEXLABS_OPENAI_QUALITY || "auto";
  const expected_seconds =
    provider === "mock"
      ? 3
      : provider === "gemini"
        ? 25
        : (EXPECTED[quality] ?? EXPECTED.auto);
  return NextResponse.json({ provider, model, quality, expected_seconds });
}
