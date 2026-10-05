import type {
  ColourRecord,
  GarmentTemplate,
  ReferenceImage,
  ZoneAssignment,
} from "./types";
import { describeMapping } from "./mapping";

export const PROMPT_VERSION = "study-prompt-v1";

const COUNT_WORDS = ["", "ONE", "TWO", "THREE"];

/**
 * Global material rules (spec §6-7). These apply to every study regardless of
 * the colours chosen. Per-colour guidance from the colour record is appended
 * per assignment.
 */
const MATERIAL_RULES = `LATEX MATERIAL RULES (apply to the whole garment):
- Realistic sheet latex: glossy enough to read clearly as latex, but NEVER mirror-like, chrome, PVC or wet-look plastic.
- Broad soft highlights, realistic studio reflections, subtle surface variation, realistic tension lines and creases at joints and panel transitions.
- METALLIC colours: metallic depth and richness only - never chrome, never mirror.
- PEARLSHEEN colours: pearlescent, soft iridescent sheen - never flat grey/white, never chrome.
- TRANSLUCENT colours: dense and saturated, predominantly solid at normal viewing distance; subtle translucency only in stretched or strongly highlighted areas. Never glass, never clear plastic, never pale washed-out tones, no skin visible through the material.
- Lighting and reflections may create bright highlights, but a highlight must never read as a different latex colour.`;

const COMPOSITION_RULES = `COMPOSITION - the LatexLabs Colour Study sheet (match the supplied canonical layout reference exactly):
- One single landscape sheet, very dark charcoal background (near-black).
- Top ~80%: FOUR full-body studio views of the SAME model wearing the garment, side by side with thin gaps: FRONT VIEW, BACK VIEW, 3/4 VIEW, SIDE VIEW. Each panel is labelled in small white uppercase letterspaced text.
- Right column (~18% width): FOUR close-up DETAIL crops stacked vertically, each labelled.
- Bottom band: brand footer. Left: the word "LATEXLABS" as the brand wordmark (LATEX in white, LABS in grey, followed by the two-slash mark - one red slash above one amber slash). Centre: the garment title and "COLOUR STUDY -" line with the colour names, plus a variant line in small type. Right: colour swatch chips, each swatch captioned with the exact colour name, manufacturer name and category in small uppercase type.
- Restrained, premium, image-first presentation. No extra ornamentation, no watermarks, no paragraphs of text.
- Photorealistic studio photography inside each panel: athletic male model, short dark hair, neutral standing pose, soft grey studio backdrop, soft directional lighting, realistic skin, realistic latex.`;

function countConstraint(n: number, names: string[]): string {
  const list = names.map((s) => `"${s}"`).join(", ");
  if (n === 1) {
    return `COLOUR COUNT - HARD CONSTRAINT:
- The garment uses EXACTLY ONE colour: ${list}.
- Every panel is the same material and colour. Panel construction stays visible through seams, shape, tension, shadows and reflections ONLY.
- Highlights may appear lighter because of reflections, but no panel may read as a second colour.`;
  }
  return `COLOUR COUNT - HARD CONSTRAINT:
- The garment uses EXACTLY ${COUNT_WORDS[n]} colours: ${list}.
- Both/all selected colours must be clearly present. NEVER introduce a third/additional colour - the garment has more structural zones than colours by design; one colour deliberately occupies multiple zones.
- Zips, trims and seams follow their zone's colour; hardware (zip puller) may be dark metal.`;
}

function colourBlock(colours: ColourRecord[], assignments: ZoneAssignment[]): string {
  const swatches = colours
    .map((c, i) => `- COLOUR ${i + 1}: "${c.display_name}" (${c.category} finish, by ${c.manufacturer}) - ${c.generation_guidance}`)
    .join("\n");
  return `SELECTED COLOURS AND MATERIAL INTERPRETATION (reference images are authoritative - treat names as materials, not hex values):
${swatches}

COLOUR ASSIGNMENT - which colour goes on which panels:
${describeMapping(assignments, colours)}`;
}

export interface BuiltPrompt {
  prompt: string;
  referenceImages: ReferenceImage[];
  variantLine: string;
}

export function buildStudyPrompt(
  garment: GarmentTemplate,
  colours: ColourRecord[],
  assignments: ZoneAssignment[],
): BuiltPrompt {
  const n = colours.length;
  const names = colours.map((c) => c.display_name);
  const joined = names.join(" + ").toUpperCase();
  const variantLine = n === 1 ? "(ONE COLOUR VARIANT)" : n === 2 ? "(TWO COLOUR VARIANT)" : "(THREE COLOUR VARIANT)";

  const detailLabels = garment.details.map((d) => d.label).join(", ");

  const prompt = `Create a LatexLabs Colour Study: a single premium visualisation sheet for a latex garment colour combination. This is a controlled visualisation task - the garment construction, panel layout and colour assignments below are fixed decisions; render them faithfully, do not redesign them.

GARMENT - ${garment.title} (fixed LatexLabs template):
${garment.construction_prompt}
Construction features: ${garment.construction.join("; ")}.
The supplied garment master reference image shows this exact template, its chevron panel construction and proportions - match its design language.

${colourBlock(colours, assignments)}

${countConstraint(n, names)}

${MATERIAL_RULES}

${COMPOSITION_RULES}
- The four detail crops for this garment: ${detailLabels}.

FOOTER TEXT TO RENDER (render exactly, small uppercase letterspaced type):
- Brand: "LATEXLABS"
- Title: "${garment.title.toUpperCase()}"
- Subtitle: "COLOUR STUDY - ${joined}"
- Variant: "${variantLine}"
- Swatch captions: each colour name + "${colours[0].manufacturer}" + its category.

The supplied colour study layout reference shows the exact composition, typography scale and footer treatment - follow it closely.`;

  const referenceImages: ReferenceImage[] = [
    {
      path: `data/references/garments/${basename(garment.master_reference)}`,
      role: "garment",
      description: `${garment.title} master template reference`,
    },
  ];
  // Canonical study sheet for layout - pick by colour count.
  const studyRef =
    n === 1
      ? "04_C_ColourStudy_1Colour_Black.png"
      : n === 2
        ? "05_C_ColourStudy_2Colour_TranslucentBlue_Black_CANONICAL.png"
        : "06_C_ColourStudy_3Colour_PearlsheenSilver_MetallicRed_Black.png";
  referenceImages.push({
    path: `data/references/studies/${studyRef}`,
    role: "layout",
    description: `canonical ${n}-colour Colour Study layout reference`,
  });
  // Colour swatch references.
  colours.forEach((c, i) => {
    const rel = c.references[0];
    if (rel) {
      referenceImages.push({
        path: `public${rel.startsWith("/") ? rel : `/${rel}`}`,
        role: "colour",
        description: `colour ${i + 1} swatch: ${c.display_name}`,
      });
    }
  });

  return { prompt, referenceImages, variantLine };
}

function basename(p: string): string {
  return p.split(/[\\/]/).pop() ?? p;
}
