"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ColourWheel from "@/components/ColourWheel";
import Nav from "@/components/Nav";
import type { ColourRecord } from "@/lib/types";

interface GarmentCard {
  id: string;
  display_name: string;
  descriptor: string;
}

function ColourStep() {
  const router = useRouter();
  const params = useSearchParams();
  const garmentId = params.get("garment");

  const [colours, setColours] = useState<ColourRecord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [finishes, setFinishes] = useState<string[]>([]);
  const [manufacturer, setManufacturer] = useState("");
  const [garmentName, setGarmentName] = useState("");

  const [selected, setSelected] = useState<string[]>(() => {
    const c = params.get("colours");
    return c ? c.split(",").filter(Boolean).slice(0, 3) : [];
  });
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [finish, setFinish] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!garmentId) router.replace("/create");
  }, [garmentId, router]);

  useEffect(() => {
    fetch("/api/colours").then((r) => r.json()).then((d) => {
      const cols: ColourRecord[] = d.colours;
      setColours(cols);
      setCategories(d.categories);
      setFinishes([...new Set(cols.map((c) => c.finish))]);
      setManufacturer(d.manufacturer ?? "");
    });
    fetch("/api/garments").then((r) => r.json()).then((d) => {
      const g = (d.garments as GarmentCard[]).find((x) => x.id === garmentId);
      if (g) setGarmentName(g.display_name);
    });
  }, [garmentId]);

  const byId = useMemo(() => new Map(colours.map((c) => [c.id, c])), [colours]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return colours.filter(
      (c) =>
        (!cat || c.category === cat) &&
        (!finish || c.finish === finish) &&
        (!q || c.display_name.toLowerCase().includes(q)),
    );
  }, [colours, cat, finish, query]);

  const visibleIds = useMemo(() => new Set(filtered.map((c) => c.id)), [filtered]);

  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s,
    );

  const create = async () => {
    if (!garmentId || selected.length === 0 || creating) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/studies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ garment_id: garmentId, colour_ids: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create study");
      router.push(`/study/${data.study_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create study");
      setCreating(false);
    }
  };

  return (
    <div className="container">
      <Nav right="02 — COLOURS" />
      <section className="section step-section">
        <div className="step-head">
          <div className="micro micro-faint">02 — COLOURS</div>
          <h2>Choose your colours.</h2>
          <p className="step-sub">
            Explore up to three colours and see how they work together on your
            chosen garment.
            {garmentName && (
              <>
                {" "}
                <span className="micro" style={{ color: "var(--muted)" }}>
                  GARMENT — {garmentName.toUpperCase()}
                </span>{" "}
                <Link className="back-link" href="/create">
                  change
                </Link>
              </>
            )}
          </p>
        </div>

        <div className="wheel-layout">
          <ColourWheel
            colours={colours}
            selected={selected}
            visibleIds={visibleIds}
            onToggle={toggle}
          />

          <div className="wheel-side">
            <div className="micro micro-faint" style={{ marginBottom: 12 }}>
              YOUR COLOURS — {selected.length} / 3
            </div>
            {selected.length === 0 ? (
              <div className="sel-empty">
                Pick 1–3 colours from the wheel.
                <br />
                Selection order decides how they&apos;re applied.
              </div>
            ) : (
              <div className="yc-row">
                {selected.map((id, i) => {
                  const c = byId.get(id);
                  if (!c) return null;
                  return (
                    <button key={id} className="yc-chip" onClick={() => toggle(id)} title={`Remove ${c.display_name}`}>
                      <span className="yc-dot" style={{ background: c.swatch_hex }} />
                      <span className="yc-name">
                        <span className="yc-num">{i + 1}</span> {c.display_name}
                      </span>
                      <span className="rm">×</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ height: 16 }} />
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={selected.length === 0 || creating}
              onClick={create}
            >
              {creating ? "Creating…" : "Create →"}
            </button>
            {error && <div className="progress-error">{error}</div>}

            <div className="wheel-tools">
              <input
                className="cp-search"
                placeholder={`Search ${manufacturer || ""} colours…`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="micro micro-faint" style={{ margin: "14px 0 8px" }}>
                CATEGORY
              </div>
              <div className="cp-cats">
                <button className={`cat-pill ${cat === null ? "on" : ""}`} onClick={() => setCat(null)}>All</button>
                {categories.map((c) => (
                  <button key={c} className={`cat-pill ${cat === c ? "on" : ""}`} onClick={() => setCat(cat === c ? null : c)}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="micro micro-faint" style={{ margin: "14px 0 8px" }}>
                FINISH
              </div>
              <div className="cp-cats">
                <button className={`cat-pill ${finish === null ? "on" : ""}`} onClick={() => setFinish(null)}>All</button>
                {finishes.map((f) => (
                  <button key={f} className={`cat-pill ${finish === f ? "on" : ""}`} onClick={() => setFinish(finish === f ? null : f)}>
                    {f}
                  </button>
                ))}
              </div>

              <div className="cl-list">
                {filtered.map((c) => {
                  const idx = selected.indexOf(c.id);
                  return (
                    <button key={c.id} className={`cl-row ${idx >= 0 ? "selected" : ""}`} onClick={() => toggle(c.id)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.references[0]} alt="" loading="lazy" />
                      <span className="cl-name">{c.display_name}</span>
                      <span className="cl-cat">{c.category}</span>
                      {idx >= 0 && <span className="yc-num">{idx + 1}</span>}
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="sel-empty">No colours match.</div>
                )}
              </div>
              <div className="micro micro-faint" style={{ marginTop: 14 }}>
                COLOUR REFERENCES — {manufacturer.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ColoursPage() {
  return (
    <Suspense fallback={<div className="container"><Nav /></div>}>
      <ColourStep />
    </Suspense>
  );
}
