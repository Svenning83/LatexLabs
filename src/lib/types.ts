// Core LatexLabs types.
// Colour records, garment templates, colour mapping and studies are kept
// fully separate so the colour library, garment templates and generation
// prompts can be iterated without restructuring the app.

export interface ColourRecord {
  id: string;
  manufacturer: string;
  display_name: string;
  category: string;
  finish: string;
  active: boolean;
  references: string[];
  source_url: string;
  generation_guidance: string;
  reference_version: string;
  swatch_hex?: string;
}

export interface ColourDatabase {
  manufacturer: string;
  reference_version: string;
  source_url: string;
  colours: ColourRecord[];
}

export type ZoneId = "shell" | "accent" | "core";

export interface GarmentZone {
  label: string;
  parts: string[];
}

export interface GarmentView {
  id: string;
  label: string;
}

export interface GarmentDetail {
  id: string;
  label: string;
}

export interface GarmentTemplate {
  id: string;
  code: string;
  name: string;
  title: string;
  /** customer-facing garment name - internal codes stay in `code`/`title` */
  display_name: string;
  /** customer-facing one-word descriptor, e.g. "Full-length" */
  descriptor: string;
  /** clean card imagery (not the technical reference board) */
  card_image: string;
  tagline: string;
  construction: string[];
  construction_prompt: string;
  master_reference: string;
  template_version: string;
  views: GarmentView[];
  details: GarmentDetail[];
  zones: Record<ZoneId, GarmentZone>;
  /** mapping[colourCount][zone] = index into the ordered selected colour list */
  mapping: Record<string, Record<ZoneId, number>>;
}

/** A resolved zone -> colour assignment, stored on the study for auditability. */
export interface ZoneAssignment {
  zone: ZoneId;
  zone_label: string;
  colour_id: string;
  colour_name: string;
  colour_index: number;
  parts: string[];
}

export type StudyStage =
  | "queued"
  | "reading_references"
  | "composing"
  | "generating"
  | "finishing"
  | "ready"
  | "failed";

export interface Study {
  study_id: string;
  manufacturer: string;
  garment_template: string;
  garment_title: string;
  garment_name: string;
  selected_colours: string[];
  selected_colour_names: string[];
  colour_mapping: ZoneAssignment[];
  reference_versions: string[];
  generated_image: string | null;
  status: StudyStage;
  error: string | null;
  provider: string;
  parent_study_id: string | null;
  created_at: string;
  /** The exact prompt sent to the provider - kept for auditability/debugging. */
  prompt?: string;
}

export interface ReferenceImage {
  path: string;
  role: "layout" | "garment" | "colour";
  description: string;
}

export interface GenerationRequest {
  study: Study;
  garment: GarmentTemplate;
  colours: ColourRecord[];
  assignments: ZoneAssignment[];
  prompt: string;
  referenceImages: ReferenceImage[];
  outPath: string;
}

export interface ImageProvider {
  name: string;
  generate(req: GenerationRequest): Promise<void>;
}
