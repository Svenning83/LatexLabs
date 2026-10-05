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
  saveStudy,
} from "./studies";
import type { GenerationRequest, Study, StudyStage } from "./types";

function setStage(study: Study, stage: StudyStage, error: string | null = null): void {
  study.status = stage;
  study.error = error;
  saveStudy(study);
}

export function createStudy(
  garmentId: string,
  colourIds: string[],
  parentStudyId: string | null = null,
): Study {
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
  saveStudy(study);
  return study;
}

/** Runs the staged generation pipeline, persisting each stage to the study. */
export async function runGeneration(studyId: string): Promise<void> {
  const study = getStudy(studyId);
  if (!study) return;
  try {
    // Stage 1 - read references: reload records, resolve mapping.
    setStage(study, "reading_references");
    const garment = getGarment(study.garment_template);
    if (!garment) throw new Error(`Garment template missing: ${study.garment_template}`);
    const colours = getColours(study.selected_colours);
    const assignments = resolveMapping(garment, colours);
    await tick();

    // Stage 2 - compose: build the structured prompt + reference set.
    setStage(study, "composing");
    const built = buildStudyPrompt(garment, colours, assignments);
    study.colour_mapping = assignments;
    const outPath = imagePathFor(study.study_id);
    await tick();

    // Stage 3 - generate via the configured provider.
    setStage(study, "generating");
    const provider = getProvider();
    study.provider = provider.name;
    saveStudy(study);
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
    setStage(study, "finishing");
    study.generated_image = `data/studies/${study.study_id}.png`;
    await tick(400);
    setStage(study, "ready");
  } catch (err) {
    setStage(study, "failed", err instanceof Error ? err.message : String(err));
  }
}

const tick = (ms = 300) => new Promise((r) => setTimeout(r, ms));
