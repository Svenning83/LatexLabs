import type {
  ColourRecord,
  GarmentTemplate,
  ReferenceImage,
  ZoneAssignment,
} from "./types";
import { describeMapping } from "./mapping";

export const PROMPT_VERSION = "study-prompt-v2";

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

/* ------------------------------------------------------------------ */
/* C Technical catsuit - canonical v2 prompt.                          */
/* One cohesive studio composition (4 views + 4 detail crops), no      */
/* rendered text/branding. Colour section adapts to 1/2/3 selections.  */
/* ------------------------------------------------------------------ */

function catsuitColourSection(colours: ColourRecord[]): string {
  const n = colours.length;
  const names = colours.map((c) => c.display_name);
  const [c1, c2, c3] = names;
  const colourList = names
    .map((s, i) => `${i + 1}. ${s} (${colours[i].category.toLowerCase()} latex)`)
    .join("\n");
  const distinct =
    n > 1
      ? `\n\n${names.join(", ")} are ${COUNT_WORDS[n].toLowerCase()} DIFFERENT colours. Each one must be clearly visible in its assigned areas and remain visually distinct from the others. Never merge, blend or drop a colour, and never let one colour read as a shade of another.`
      : "";
  if (n === 1) {
    return `COLOURS:
Use exactly this one selected colour:
${colourList}

Apply it consistently across all four views: the entire catsuit is ${c1} - central body, outer side areas and stripe all share the same colour. Colour boundaries are invisible; only highlights, shadows and creasing differentiate the surface. Do not introduce additional colours, gradients or colour bleeding.`;
  }
  if (n === 2) {
    return `COLOURS:
Use exactly these two selected colours:
${colourList}

Apply them consistently across all four views:
- ${c1} = primary central/main body colour AND the narrow stripe (the stripe shares the central colour)
- ${c2} = broad outer side areas running down the outside of the arms and legs

Both colours must be clearly visible. The arrangement must remain consistent from front to rear and through the side and three-quarter views. Do not introduce additional colours, gradients, a contrasting stripe or colour bleeding.${distinct}`;
  }
  return `COLOURS:
Use exactly these three selected colours:
${colourList}

Apply them consistently across all four views:
- ${c1} = primary central/main body colour
- ${c2} = broad outer side areas running down the outside of the arms and legs
- ${c3} = one narrow, clearly visible stripe between the outer colour and the central colour

All three colours must be clearly visible. The arrangement must remain consistent from front to rear and through the side and three-quarter views. Do not introduce additional colours, gradients or colour bleeding.${distinct}`;
}

function buildCatsuitPrompt(colours: ColourRecord[]): string {
  const materialNotes = colours
    .map((c, i) => `- COLOUR ${i + 1} "${c.display_name}" (${c.category} finish): ${c.generation_guidance}`)
    .join("\n");

  return `Create a high-end, photorealistic studio product photoshoot of a single adult male model wearing a C Technical latex catsuit.

The final image is ONE COHESIVE STUDIO PHOTOGRAPHIC COMPOSITION, not a collage of separately generated images.

FOUR FULL-BODY VIEWS:
Show the SAME model wearing the SAME catsuit in four coordinated views:
1. Front view
2. Rear view
3. Side / profile view
4. Three-quarter front view

The four views should appear together as if photographed during the same professional studio photoshoot, with the same model, physical proportions, garment, lighting, camera quality, background and consistent scale.

The four views must not look like separate cut-out images. They should share a continuous visual environment with consistent studio lighting, floor, shadows and atmosphere. Avoid obvious vertical panel joins or hard compositing boundaries.

MODEL:
Adult male with neutral, natural, athletic proportions. Moderately broad shoulders, natural chest, relatively straight waist and understated hips. Ordinary fit adult man rather than bodybuilder or fashion model. Neutral expression and relaxed professional product-photography poses. Keep the model visually secondary to the garment. Bare feet are acceptable. No shoes, boots, socks or accessories.

GARMENT:
Full-length, skin-tight latex catsuit with long sleeves ending at the wrists and full-length legs ending at the ankles. Use the C Technical catsuit silhouette established for LatexLabs. The garment should fit naturally and realistically, gently tensioned against the body without excessive compression.

The catsuit is made from glued sheet latex, not sewn fabric. The neckline is a simple low rounded opening cut directly through the latex sheet. Wrists and ankles have simple open cut edges directly through the latex sheet.

NO collar, neck band, cuffs, waistband, piping, folded edges, reinforced edges, facing, zips, buttons, fasteners or decorative construction. Avoid visible stitching and obvious physical seams.

Colour boundaries are changes of colour within the same continuous latex surface. They must NOT appear as raised panels, seams, piping or separate pieces. The area around the neckline must remain clean and simple. Do not create collarbone lines, shoulder seams, curved decorative lines or secondary outlines around the neckline.

${catsuitColourSection(colours)}

MATERIAL INTERPRETATION PER COLOUR (reference swatches are authoritative):
${materialNotes}

LATEX MATERIAL:
Realistic high-quality latex rubber with a refined glossy/satin finish. Clearly latex: smooth, slightly reflective and luxurious, but not wet, chrome-like or mirror-polished. Broad controlled studio reflections rather than harsh white hotspots. Subtle, natural irregular creasing where the latex bends around elbows, knees, hips and other areas of movement. Avoid excessive wrinkles or repeated symmetrical wrinkle patterns.

STUDIO:
One continuous premium studio environment. Dark charcoal-to-grey gradient background with a slightly lighter area behind the models. Neutral grey studio floor with subtle realistic grounding shadows. Soft cinematic studio lighting consistent across all four views.

COMPOSITION:
The four full-body views occupy the main large area and are visually integrated into one continuous photographic presentation rather than appearing as four unrelated rectangular photographs. Maintain generous spacing between figures while allowing the studio background and floor to visually continue behind and around them.

On the RIGHT side of the composition, include four smaller close-up views arranged vertically.

DETAIL VIEW 1 - NECK / SHOULDER:
Close-up of the neckline, upper chest and shoulder showing the latex finish and transition between the selected colours.

DETAIL VIEW 2 - ARM / WRIST:
Close-up of the sleeve and wrist showing the latex surface, colour arrangement and simple open wrist edge.

DETAIL VIEW 3 - LEG / KNEE / ANKLE:
Close-up showing the leg, colour arrangement, subtle latex creasing and simple ankle opening.

DETAIL VIEW 4 - REAR HIP / SEAT:
Close-up of the rear hip and seat showing how the colour design wraps around the back of the garment.

The close-ups should appear to come from the SAME garment and SAME photoshoot as the four full-body views. They should be clean photographic details, not technical illustrations.

IMPORTANT:
The final image must contain NO text, NO labels, NO logos, NO colour swatches, NO captions, NO measurements and NO watermarks. LatexLabs will add all interface elements, colour names and controls separately.

AVOID:
separate collage panels, obvious image joins, mismatched backgrounds, inconsistent lighting, different models, different body proportions, different garments, mannequin, fantasy anatomy, exaggerated muscles, exaggerated hips, feminine proportions, bodybuilder physique, fashion accessories, shoes, boots, socks, zips, collars, cuffs, waistbands, stitching, decorative seams, raised colour panels, piping, excessive wrinkles, wet plastic, chrome reflections, harsh highlights, extra colours, text, logos, labels, watermarks or props.`;
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

  if (garment.id === "c") {
    const referenceImages: ReferenceImage[] = [
      {
        path: `public/garments/catsuit.png`,
        role: "garment",
        description: `${garment.title} garment reference (construction and colour-arrangement example)`,
      },
    ];
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
    return {
      prompt: buildCatsuitPrompt(colours),
      referenceImages,
      variantLine,
    };
  }

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
