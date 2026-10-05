import type {
  ColourRecord,
  GarmentTemplate,
  ZoneAssignment,
  ZoneId,
} from "./types";

export const MAX_COLOURS = 3;

/**
 * THE MOST IMPORTANT RULE:
 * The number of selected colours determines the colour-mapping complexity.
 * Exactly N selected colours => exactly N garment colours. Never invent an
 * extra colour because the garment has more structural zones than colours.
 *
 * Mapping is driven by garment.mapping (data, not code) so the canonical
 * layouts can be iterated per template:
 *   1 colour: every zone takes colour[0] - monochrome.
 *   2 colours: shell+accent take colour[0], core takes colour[1]
 *              (canonical Translucent Blue + Black layout).
 *   3 colours: accent takes colour[0], shell takes colour[1],
 *              core takes colour[2] (canonical Silver+Red+Black layout).
 */
export function resolveMapping(
  garment: GarmentTemplate,
  colours: ColourRecord[],
): ZoneAssignment[] {
  const n = colours.length;
  if (n < 1 || n > MAX_COLOURS) {
    throw new Error(`Select between 1 and ${MAX_COLOURS} colours (got ${n})`);
  }
  const rule = garment.mapping[String(n)];
  if (!rule) {
    throw new Error(`Garment ${garment.id} has no mapping rule for ${n} colours`);
  }

  const used = new Set<number>();
  const assignments = (Object.keys(rule) as ZoneId[]).map((zone) => {
    const idx = rule[zone];
    if (idx < 0 || idx >= n) {
      throw new Error(`Mapping for zone ${zone} references colour ${idx} (only ${n} selected)`);
    }
    used.add(idx);
    return {
      zone,
      zone_label: garment.zones[zone].label,
      colour_id: colours[idx].id,
      colour_name: colours[idx].display_name,
      colour_index: idx,
      parts: garment.zones[zone].parts,
    } satisfies ZoneAssignment;
  });

  // Guard: every selected colour must actually appear on the garment.
  if (used.size !== n) {
    throw new Error(`Mapping for ${garment.id}/${n} colours does not use all selected colours`);
  }

  // Emit in canonical order: accent, shell, core reads most naturally.
  const order: ZoneId[] = ["accent", "shell", "core"];
  return assignments.sort((a, b) => order.indexOf(a.zone) - order.indexOf(b.zone));
}

/** Human-readable colour story used inside the generation prompt. */
export function describeMapping(assignments: ZoneAssignment[], colours: ColourRecord[]): string {
  const byId = new Map(colours.map((c, i) => [c.id, i]));
  return assignments
    .map((a) => {
      const pos = (byId.get(a.colour_id) ?? a.colour_index) + 1;
      const parts = a.parts.join(", ");
      return `- COLOUR ${pos} "${a.colour_name}" -> ${a.zone_label}: ${parts}`;
    })
    .join("\n");
}
