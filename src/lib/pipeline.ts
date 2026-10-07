import fs from "node:fs";
import { getColours } from "./colours";
import { getGarment } from "./garments";
import { resolveMapping } from "./mapping";
import { buildStudyPrompt, PROMPT_VERSION } from "./prompt";
import { getProvider } from "./providers";
import {
  createStudyId,
  getStudy,
  imagePathFor,
  persistStudyImage,
  saveStudy,
} from "./studies";
import type { GenerationRequest, Study, StudyStage } from "./types";

async function setStage(study: Study, stage: StudyStage, error: string | null = null): Promise<void> {
  study.status = stage;
  study.error = error;
  await saveStudy(study);
}

export async function createStudy(
  garmentId: string,
  colourIds: string[],
  parentStudyId: string | null = null,
): Promise<Study> {
  const garment = getGarment(garmentId);
  if (!garment) throw new Error(`Unknown garment template: ${garmentId}`);
  const colours = getColours(colourIds);
  if (colours.length !== colourIds.length) {
    throw new Error("One or more selected colours were not found");
  }
  const assignments = resolveMapping(garment, colours);
  const versions = [
    colours[0].reference_version,
    garment.template_version,
    PROMPT_VERSION,
    "study-layout-v1",
  ];

  const study: Study = {
    study_id: createStudyId(),
    manufacturer: colours[0].manufacturer,
    garment_template: garment.id,
    garment_title: garment.title,
    garment_name: garment.display_name ?? garment.name,
    selected_colours: colourIds,
    selected_colour_names: colours.map((c) => c.display_name),
    colour_mapping: assignments,
    reference_versions: [...new Set(versions)],
    generated_image: null,
    status: "queued",
    error: null,
    provider: "pending",
    parent_study_id: parentStudyId,
    created_at: new Date().toISOString(),
  };
  await saveStudy(study);
  return study;
}

/** Runs the staged generation pipeline, persisting each stage to the study. */
export async function runGeneration(studyId: string): Promise<void> {
  const study = await getStudy(studyId);
  if (!study) return;
  try {
    // Stage 1 - read references: reload records, resolve mapping.
    await setStage(study, "reading_references");
    const garment = getGarment(study.garment_template);
    if (!garment) throw new Error(`Garment template missing: ${study.garment_template}`);
    const colours = getColours(study.selected_colours);
    const assignments = resolveMapping(garment, colours);
    await tick();

    // Stage 2 - compose: build the structured prompt + reference set.
    await setStage(study, "composing");
    const built = buildStudyPrompt(garment, colours, assignments);
    study.colour_mapping = assignments;
    study.prompt = built.prompt;
    await saveStudy(study);
    const outPath = imagePathFor(study.study_id);
    await tick();

    // Stage 3 - generate via the configured provider.
    await setStage(study, "generating");
    const provider = getProvider();
    study.provider = provider.name;
    await saveStudy(study);
    const req: GenerationRequest = {
      study,
      garment,
      colours,
      assignments,
      prompt: built.prompt,
      referenceImages: built.referenceImages,
      outPath,
    };
    await provider.generate(req);
    if (!fs.existsSync(outPath)) {
      throw new Error("Provider finished without writing an image");
    }

    // Stage 4 - finish.
    await setStage(study, "finishing");
    study.generated_image = await persistStudyImage(study.study_id);
    await tick(400);
    await setStage(study, "ready");
  } catch (err) {
    await setStage(study, "failed", err instanceof Error ? err.message : String(err));
  }
}

const tick = (ms = 300) => new Promise((r) => setTimeout(r, ms));
