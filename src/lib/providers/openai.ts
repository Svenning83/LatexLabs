import fs from "node:fs";
import path from "node:path";
import type { GenerationRequest, ImageProvider } from "../types";

const MODEL = process.env.LATEXLABS_OPENAI_MODEL || "gpt-image-1";

export const openaiProvider: ImageProvider = {
  name: "openai",

  async generate(req: GenerationRequest): Promise<void> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

    const form = new FormData();
    form.append("model", MODEL);
    form.append("prompt", req.prompt);
    form.append("size", "1536x1024");
    for (const ref of req.referenceImages) {
      const abs = path.join(process.cwd(), ref.path);
      if (!fs.existsSync(abs)) continue;
      const buf = fs.readFileSync(abs);
      form.append("image[]", new Blob([buf], { type: "image/png" }), path.basename(abs));
    }

    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenAI API ${res.status}: ${body.slice(0, 500)}`);
    }
    const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
    const item = json.data?.[0];
    if (item?.b64_json) {
      fs.writeFileSync(req.outPath, Buffer.from(item.b64_json, "base64"));
      return;
    }
    if (item?.url) {
      const img = await fetch(item.url);
      fs.writeFileSync(req.outPath, Buffer.from(await img.arrayBuffer()));
      return;
    }
    throw new Error("OpenAI returned no image");
  },
};
