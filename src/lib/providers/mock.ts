import fs from "node:fs";
import path from "node:path";
import type { GenerationRequest, ImageProvider } from "../types";

const CANONICAL: Record<number, string> = {
  1: "04_C_ColourStudy_1Colour_Black.png",
  2: "05_C_ColourStudy_2Colour_TranslucentBlue_Black_CANONICAL.png",
  3: "06_C_ColourStudy_3Colour_PearlsheenSilver_MetallicRed_Black.png",
};

/**
 * Development provider: returns the canonical Colour Study sheet matching the
 * selected colour count (or an exact canonical combination when chosen).
 * Lets the full product flow run without a generation API key.
 */
export const mockProvider: ImageProvider = {
  name: "mock",

  async generate(req: GenerationRequest): Promise<void> {
    const ids = req.study.selected_colours;
    let file = CANONICAL[req.study.selected_colours.length] ?? CANONICAL[1];
    if (ids.includes("libidex_translucent_blue") && ids.includes("libidex_black")) {
      file = CANONICAL[2];
    } else if (
      ids.includes("libidex_pearlsheen_silver") &&
      ids.includes("libidex_metallic_red")
    ) {
      file = CANONICAL[3];
    }
    const src = path.join(process.cwd(), "data", "references", "studies", file);
    await new Promise((r) => setTimeout(r, 1200)); // simulate generation latency
    fs.copyFileSync(src, req.outPath);
  },
};
