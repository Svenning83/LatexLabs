import fs from "node:fs";
import path from "node:path";
import type { GenerationRequest, ImageProvider } from "../types";

const MODEL = process.env.LATEXLABS_GEMINI_MODEL || "gemini-2.5-flash-image";

function mime(p: string): string {
  const ext = path.extname(p).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

export const geminiProvider: ImageProvider = {
  name: "gemini",

  async generate(req: GenerationRequest): Promise<void> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const parts: unknown[] = [{ text: req.prompt }];
    for (const ref of req.referenceImages) {
      const abs = path.join(process.cwd(), ref.path);
      if (!fs.existsSync(abs)) {
        throw new Error(`Reference image missing: ${ref.path} (check outputFileTracingIncludes on serverless)`);
      }
      parts.push({ text: `${ref.role.toUpperCase()} REFERENCE - ${ref.description}:` });
      parts.push({
        inlineData: { mimeType: mime(abs), data: fs.readFileSync(abs).toString("base64") },
      });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: { aspectRatio: "3:2" },
          },
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gemini API ${res.status}: ${body.slice(0, 500)}`);
    }
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[];
    };
    const imgPart = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!imgPart?.inlineData?.data) {
      throw new Error("Gemini returned no image (check prompt/quotas)");
    }
    fs.writeFileSync(req.outPath, Buffer.from(imgPart.inlineData.data, "base64"));
  },
};
