"use client";

import { useMemo, useState } from "react";
import type { ColourRecord } from "@/lib/types";

interface Pt {
  c: ColourRecord;
  x: number;
  y: number;
  hue: number;
}

const SIZE = 620;
const C = SIZE / 2;
const R_MAX = 272;
const DOT = 12;

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue = 0;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) hue = ((b - r) / d + 2) * 60;
  else hue = ((r - g) / d + 4) * 60;
  return [hue, s, l];
}

function hueDist(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** Lay colour dots out on a hue wheel; radius = saturation (muted inwards). */
function layout(colours: ColourRecord[]): Pt[] {
  const pts: Pt[] = colours.map((c) => {
    const [hue, s] = hexToHsl(c.swatch_hex ?? "#888888");
    const r = R_MAX * (0.16 + 0.84 * s);
    const a = ((hue - 90) * Math.PI) / 180; // hue 0 (reds) at top
    return { c, hue, x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
  });
  // gentle relaxation so near-neutral neighbours don't stack
  for (let i = 0; i < 80; i++) {
    for (let a = 0; a < pts.length; a++) {
      for (let b = a + 1; b < pts.length; b++) {
        const dx = pts[b].x - pts[a].x;
        const dy = pts[b].y - pts[a].y;
        const d2 = dx * dx + dy * dy;
        const min = DOT * 2.1;
        if (d2 < min * min && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const push = (min - d) / 2 / d;
          pts[a].x -= dx * push;
          pts[a].y -= dy * push;
          pts[b].x += dx * push;
          pts[b].y += dy * push;
        }
      }
    }
  }
  // keep everything inside the wheel
  for (const p of pts) {
    const dx = p.x - C;
    const dy = p.y - C;
    const d = Math.hypot(dx, dy);
    if (d > R_MAX) {
      p.x = C + (dx / d) * R_MAX;
      p.y = C + (dy / d) * R_MAX;
    }
  }
  return pts;
}

export default function ColourWheel({
  colours,
  selected,
  visibleIds,
  onToggle,
}: {
  colours: ColourRecord[];
  selected: string[];
  visibleIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const pts = useMemo(() => layout(colours), [colours]);
  const byId = useMemo(() => new Map(colours.map((c) => [c.id, c])), [colours]);

  // harmony hints when exactly one colour is chosen
  const anchor = selected.length === 1 ? pts.find((p) => p.c.id === selected[0]) : null;
  const harmony = (p: Pt): "complement" | "analogous" | null => {
    if (!anchor || p.c.id === anchor.c.id) return null;
    const comp = hueDist(p.hue, (anchor.hue + 180) % 360);
    if (comp < 22) return "complement";
    const ana = Math.min(hueDist(p.hue, (anchor.hue + 32) % 360), hueDist(p.hue, (anchor.hue + 328) % 360));
    if (ana < 20) return "analogous";
    return null;
  };

  const hover = hovered ? byId.get(hovered) : null;

  return (
    <div className="wheel-wrap">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="wheel" role="listbox" aria-label="Colour wheel">
        {/* guide rings + spokes */}
        {[0.35, 0.65, 1].map((f) => (
          <circle key={f} cx={C} cy={C} r={R_MAX * f} className="wheel-guide" />
        ))}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <line
              key={i}
              className="wheel-spoke"
              x1={C + Math.cos(a) * R_MAX * 0.16}
              y1={C + Math.sin(a) * R_MAX * 0.16}
              x2={C + Math.cos(a) * R_MAX}
              y2={C + Math.sin(a) * R_MAX}
            />
          );
        })}

        {pts.map((p) => {
          const idx = selected.indexOf(p.c.id);
          const isSel = idx >= 0;
          const visible = visibleIds.has(p.c.id);
          const rel = harmony(p);
          const isHover = hovered === p.c.id;
          return (
            <g
              key={p.c.id}
              transform={`translate(${p.x},${p.y})`}
              className={`wheel-dot ${isSel ? "sel" : ""} ${isHover ? "hov" : ""}`}
              style={{ opacity: visible ? 1 : 0.14 }}
              onMouseEnter={() => setHovered(p.c.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onToggle(p.c.id)}
              role="option"
              aria-selected={isSel}
              aria-label={p.c.display_name}
            >
              {rel && <circle r={DOT + 7} className={`wheel-hint ${rel}`} />}
              {isSel && <circle r={DOT + 6} className="wheel-selring" />}
              <circle
                r={isHover || isSel ? DOT + 2.5 : DOT}
                fill={p.c.swatch_hex}
                stroke="rgba(255,255,255,.28)"
                strokeWidth={isSel ? 1.6 : 0.8}
                style={{ transition: "r .12s" }}
              />
              {/* gloss chip so dots read as latex swatches */}
              <circle cx={-DOT / 3} cy={-DOT / 3} r={DOT / 3} fill="rgba(255,255,255,.28)" />
              {isSel && (
                <text y={4} textAnchor="middle" className="wheel-num">
                  {idx + 1}
                </text>
              )}
            </g>
          );
        })}

        {/* centre readout */}
        <g className="wheel-centre">
          {hover ? (
            <>
              <circle cx={C} cy={C - 34} r={17} fill={hover.swatch_hex} stroke="rgba(255,255,255,.3)" />
              <text x={C} y={C + 4} textAnchor="middle" className="wc-name">
                {hover.display_name}
              </text>
              <text x={C} y={C + 26} textAnchor="middle" className="wc-sub">
                {`${hover.category} · ${hover.manufacturer}`}
              </text>
            </>
          ) : (
            <>
              <text x={C} y={C - 6} textAnchor="middle" className="wc-name">
                {selected.length > 0 ? `${selected.length} selected` : "Colour wheel"}
              </text>
              <text x={C} y={C + 18} textAnchor="middle" className="wc-sub">
                {selected.length === 1
                  ? "amber = complementary · white = similar"
                  : "select up to 3"}
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
