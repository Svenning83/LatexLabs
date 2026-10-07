import type {
  ColourRecord,
  GarmentTemplate,
  ReferenceImage,
  ZoneAssignment,
} from "./types";
import { describeMapping } from "./mapping";

export const PROMPT_VERSION = "study-prompt-v3";

const COUNT_WORDS = ["", "ONE", "TWO", "THREE"];

export interface BuiltPrompt {
  prompt: string;
  referenceImages: ReferenceImage[];
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

/* ------------------------------------------------------------------ */
/* S1 Technical singlet - canonical v2 port.                            */
/* Same composition architecture as C, but keeps S1's own construction: */
/* stand collar + technical panels; front zip intentionally omitted.    */
/* ------------------------------------------------------------------ */

function zoneColourSection(
  garmentCode: string,
  garmentName: string,
  trimWord: string,
  colours: ColourRecord[],
  assignments: ZoneAssignment[],
): string {
  const n = colours.length;
  const names = colours.map((c) => c.display_name);
  const colourList = names
    .map((s, i) => `${i + 1}. ${s} (${colours[i].category.toLowerCase()} latex)`)
    .join("\n");
  const distinct =
    n > 1
      ? `\n\n${names.join(", ")} are ${COUNT_WORDS[n].toLowerCase()} DIFFERENT colours. Each selected colour must be clearly visible in its assigned zones and remain visually distinct. Never merge, blend, drop or replace a selected colour, and never let one colour read merely as a shade of another.`
      : "";
  const countNote =
    n === 1
      ? `The number of selected colours is authoritative: the entire ${garmentName} is monochrome - panels, seams and construction stay visible through construction, shadows and reflections only, never as extra colours.`
      : `The number of selected colours is authoritative: the garment must never contain more distinct garment colours than the ${COUNT_WORDS[n].toLowerCase()} selected. Do not create an extra colour through hardware, seam material, ${trimWord} trim or reflections.`;
  return `COLOURS:
Use exactly ${n === 1 ? "this one" : `these ${COUNT_WORDS[n].toLowerCase()}`} selected colour${n === 1 ? "" : "s"}:
${colourList}

Apply ${n === 1 ? "it" : "them"} to the ${garmentCode}'s physical construction zones, consistently across all four views:
${describeMapping(assignments, colours)}

${countNote} Colour boundaries should follow the ${garmentCode} construction and its mapped zones, and must not create unrequested physical ridges or seams. Do not introduce additional colours, gradients or colour bleeding.${distinct}`;
}

function buildSingletPrompt(colours: ColourRecord[], assignments: ZoneAssignment[]): string {
  const materialNotes = colours
    .map((c, i) => `- COLOUR ${i + 1} "${c.display_name}" (${c.category} finish): ${c.generation_guidance}`)
    .join("\n");

  return `Create a high-end, photorealistic studio product photoshoot of a single adult male model wearing the LatexLabs S1 technical latex singlet.

The final image is ONE COHESIVE STUDIO PHOTOGRAPHIC COMPOSITION, not a collage of separately generated images.

FOUR FULL-BODY VIEWS:
Show the SAME adult male model wearing the SAME S1 singlet in four coordinated views:
1. Front view
2. Rear view
3. Side / profile view
4. Three-quarter front view

All four views must look as though they were photographed during the SAME professional studio photoshoot, with the same model, body proportions, garment, construction, lighting, camera quality, background and scale. They must share one continuous visual environment. Avoid obvious cut-out joins, mismatched lighting or unrelated panel boundaries.

MODEL:
Adult male with neutral, natural athletic proportions: moderately broad shoulders, natural chest, relatively straight waist and understated hips. Fit adult rather than bodybuilder or fashion model. Neutral expression and relaxed professional product-photography poses. Bare feet are acceptable. No shoes, boots, socks or accessories. The model is secondary to the garment.

GARMENT - S1 CONSTRUCTION:
Sleeveless technical latex singlet with short legs ending around mid-thigh. Preserve the established S1 garment construction exactly:
- Stand collar.
- Clean uninterrupted front panel - there is NO front zip or front closure of any kind.
- Technical panel construction.
- Realistic flat bonded latex construction lines where they belong to the S1 design.
- Close athletic fit.
- Clean short-leg openings.

The garment is real glued-sheet latex with realistic bonded technical construction. Do NOT replace S1's collar or panel construction with the collarless construction used by the C catsuit.

The stand collar must read as a real latex collar integrated into the garment, not as a separate fabric neck band.

PANEL CONSTRUCTION AND OPENINGS:
S1 is a technically panelled latex garment. Flat bonded joins between genuine latex panels are part of the design and should remain visible but subtle.

These panel joins must look like bonded sheet-latex construction, not sewn fabric. They are flat construction joins between adjacent latex sheets, not raised seams, piping or decorative edging.

Do NOT add piping, binding or raised edging to any opening. The armholes and short-leg openings terminate in simple, direct cut edges through the latex sheet, with no separate material around them - no border, rim, piping, facing, folded edge, rolled edge, cuff, reinforced strip or secondary outline.

The stand collar is a genuine part of the S1 design and may have its own flat bonded construction where physically necessary, but it must not become a padded, fabric-like or separately edged collar.

Colour transitions may coincide with genuine panel joins, but colour boundaries must NOT automatically create raised edges, piping or decorative outlines.

Do not invent additional zips, fasteners, pockets, hardware, straps or decorative construction.

${zoneColourSection("S1", "singlet", "collar", colours, assignments)}

MATERIAL INTERPRETATION PER COLOUR (reference swatches are authoritative):
${materialNotes}

Interpret each colour according to its recorded finish: metallic colours are metallic latex, never chrome or mirror metal; pearlsheen colours have a pearlescent sheen; translucent colours show appropriate realistic latex translucency; standard colours are normal glossy latex; Supatex colours carry a deeper, higher-gloss finish. Lighting and reflections must not create a persistent additional colour - specular highlights remain lighting reflections, not garment colours.

LATEX AND CONSTRUCTION:
Realistic latex rubber with a refined glossy/satin surface appropriate to each selected finish. The garment should look tactile and physically plausible rather than futuristic or CGI-like. Technical seams and panels should have realistic flat bonded construction - visible enough to communicate the S1 design, but restrained and natural. The word "seam" never means raised piping, binding or edging. Use subtle natural creasing around shoulders, torso, hips, crotch and short-leg movement areas. Avoid excessive wrinkles, repeated symmetrical folds or bunching.

STUDIO:
One continuous premium studio environment: dark charcoal-to-grey gradient background with a slightly lighter area behind the models, neutral grey studio floor, soft realistic grounding shadows, soft cinematic directional studio lighting consistent across all four views.

COMPOSITION:
The four full-body views occupy the main area and read as one coordinated studio photoshoot. On the RIGHT side, include four smaller close-up photographic details:

DETAIL VIEW 1 - COLLAR / UPPER CHEST:
Close-up of the stand collar, upper chest and clean front panel construction.

DETAIL VIEW 2 - SHOULDER / PANEL:
Close-up of the technical panel construction and flat bonded latex joins around the shoulder and armhole.

DETAIL VIEW 3 - LEG / OPENING:
Close-up of the short leg, mapped colour zones and the clean leg opening edge.

DETAIL VIEW 4 - REAR HIP / SEAT:
Close-up of the rear panel construction and colour arrangement around the seat.

The close-ups must come from the SAME S1 garment and SAME photoshoot as the four full-body views. They are photographic material and colour studies, not construction diagrams - do not exaggerate or invent seams at close range.

IMPORTANT:
The final image must contain NO text, NO labels, NO logos, NO colour names, NO swatches, NO captions, NO measurements and NO watermarks. LatexLabs adds all interface elements separately.

AVOID:
different models between views, inconsistent body proportions, collage-like joins, mismatched lighting, futuristic CGI clothing, applying the C catsuit's collarless construction to S1, missing stand collar, front zips or plackets, invented fasteners or hardware, extra colours, merged colours, chrome-like metallics, incorrect translucent behaviour, unrequested seams, decorative diagram lines, exaggerated muscles, exaggerated hips, feminine proportions, bodybuilder physique, fashion accessories, shoes, boots, socks, excessive wrinkles, wet plastic, harsh highlights, text, logos, watermarks or props.`;
}

/* ------------------------------------------------------------------ */
/* SH1 Technical shorts - canonical v2 port.                            */
/* Same composition architecture; keeps integrated waistband + panel    */
/* construction; front zip intentionally omitted.                       */
/* ------------------------------------------------------------------ */

function buildShortsPrompt(colours: ColourRecord[], assignments: ZoneAssignment[]): string {
  const materialNotes = colours
    .map((c, i) => `- COLOUR ${i + 1} "${c.display_name}" (${c.category} finish): ${c.generation_guidance}`)
    .join("\n");

  return `Create a high-end, photorealistic studio product photoshoot of a single adult male model wearing the LatexLabs SH1 technical latex shorts.

The final image is ONE COHESIVE STUDIO PHOTOGRAPHIC COMPOSITION, not a collage of separately generated images.

FOUR FULL-BODY VIEWS:
Show the SAME adult male model wearing the SAME SH1 shorts in four coordinated views:
1. Front view
2. Rear view
3. Side / profile view
4. Three-quarter front view

All four views must look as though they were photographed during the SAME professional studio photoshoot, with the same model, body proportions, garment, construction, lighting, camera quality, background and scale. They must share one continuous visual environment. Avoid obvious cut-out joins, mismatched lighting or unrelated panel boundaries.

MODEL:
Adult male with neutral, natural athletic proportions and a relatively straight masculine waist and hips. Fit adult rather than bodybuilder or fashion model. Neutral expression and relaxed product-photography poses. Bare feet are acceptable. No shoes, boots, socks or accessories. Keep the model secondary to the garment.

GARMENT - SH1 CONSTRUCTION:
Technical latex shorts ending around mid-thigh. Preserve the established SH1 garment construction exactly:
- Integrated waistband.
- Defined central/front panel.
- Defined side panels.
- Restrained rear construction.
- Clean leg openings.
- Close athletic fit.

The waistband must remain an integral part of the garment and read as real SH1 construction, not as an accidental extra strip or a separate fabric-like band. The front of the garment is a clean uninterrupted latex surface: there is NO front zip, zipper hardware or decorative front closure. The central and side panels should communicate the established SH1 design through realistic flat bonded joins and controlled colour placement.

Do not invent additional zips, fasteners, pockets, hardware, straps or decorative construction.

PANEL CONSTRUCTION AND OPENINGS:
SH1 uses technical panel construction, but the construction must remain visually restrained. Panel joins are subtle, flat bonded joins between genuine latex areas - never raised seams, piping, binding, facing, rolled edges, cuffs or decorative borders. The leg openings are simple, clean cut latex edges with no piping, binding, cuff, facing or reinforced border. Colour transitions may follow genuine panel boundaries, but a colour boundary must NOT automatically create a raised seam or trim.

${zoneColourSection("SH1", "shorts", "waistband", colours, assignments)}

MATERIAL INTERPRETATION PER COLOUR (reference swatches are authoritative):
${materialNotes}

Interpret each colour according to its recorded finish: metallic colours are metallic latex, never chrome or mirror metal; pearlsheen colours have a pearlescent sheen; translucent colours show appropriate realistic latex translucency; standard colours are normal glossy latex; Supatex colours carry a deeper, higher-gloss finish. Lighting and reflections must not create a persistent additional colour - specular highlights remain lighting reflections, not garment colours.

LATEX AND CONSTRUCTION:
Realistic latex rubber with a refined glossy/satin surface appropriate to each selected finish. The shorts should look tactile and physically plausible rather than futuristic or CGI-like. The waistband, central/front panel, side panels and rear construction should be communicated through realistic bonded latex construction; keep the rear construction restrained. Use subtle natural creasing around the waistband, hips, crotch and where the legs move. Avoid excessive wrinkles, repeated symmetrical folds or bunching.

STUDIO:
One continuous premium studio environment: dark charcoal-to-grey gradient background with a slightly lighter area behind the models, neutral grey studio floor, soft realistic grounding shadows, soft cinematic directional studio lighting consistent across all four views.

COMPOSITION:
The four full-body views occupy the main area and read as one coordinated studio photoshoot. On the RIGHT side, include four smaller close-up photographic details:

DETAIL VIEW 1 - WAISTBAND / UPPER SHORTS:
Close-up of the integrated waistband and the upper front construction, with no visible zipper.

DETAIL VIEW 2 - FRONT PANEL:
Close-up of the central/front panel and its colour and flat bonded construction.

DETAIL VIEW 3 - SIDE / LEG:
Close-up of the side panel, colour arrangement and the clean mid-thigh leg opening.

DETAIL VIEW 4 - REAR HIP / SEAT:
Close-up of the restrained rear construction and colour arrangement around the seat.

The close-ups must come from the SAME SH1 garment and SAME photoshoot as the four full-body views. They are photographic material and colour studies, not construction diagrams - do not exaggerate or invent seams at close range.

IMPORTANT:
The final image must contain NO text, NO labels, NO logos, NO colour names, NO swatches, NO captions, NO measurements and NO watermarks. LatexLabs adds all interface elements separately.

AVOID:
different models between views, inconsistent body proportions, collage-like joins, mismatched lighting, futuristic CGI clothing, missing waistband, visible zippers or fly hardware, invented fasteners or hardware, extra colours, merged colours, chrome-like metallics, incorrect translucent behaviour, unrequested seams, decorative diagram lines, exaggerated muscles, exaggerated hips, feminine proportions, excessive wrinkles, wet plastic, harsh highlights, text, logos, watermarks or props.`;
}

export function buildStudyPrompt(
  garment: GarmentTemplate,
  colours: ColourRecord[],
  assignments: ZoneAssignment[],
): BuiltPrompt {
  const cardImage = { c: "catsuit", s1: "singlet", sh1: "shorts" }[garment.id];
  if (!cardImage) {
    throw new Error(`No prompt builder for garment "${garment.id}"`);
  }

  const referenceImages: ReferenceImage[] = [
    {
      path: `public/garments/${cardImage}.png`,
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
    prompt:
      garment.id === "c"
        ? buildCatsuitPrompt(colours)
        : garment.id === "s1"
          ? buildSingletPrompt(colours, assignments)
          : buildShortsPrompt(colours, assignments),
    referenceImages,
  };
}
