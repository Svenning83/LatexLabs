"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

interface GarmentCard {
  id: string;
  display_name: string;
  descriptor: string;
  card_image: string;
  tagline: string;
}

function GarmentStep() {
  const router = useRouter();
  const [garments, setGarments] = useState<GarmentCard[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/garments")
      .then((r) => r.json())
      .then((d) => setGarments(d.garments));
  }, []);

  return (
    <div className="container">
      <Nav right="01 — GARMENT" />
      <section className="section step-section">
        <div className="step-head">
          <div className="micro micro-faint">01 — GARMENT</div>
          <h2>Choose your garment.</h2>
          <p className="step-sub">
            Select a garment to start exploring colour combinations.
          </p>
        </div>

        <div className="garment-grid garment-grid-tall">
          {garments.map((g) => (
            <button
              key={g.id}
              className={`garment-card garment-card-tall ${selected === g.id ? "selected" : ""}`}
              onClick={() => setSelected(g.id)}
            >
              <div className="g-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.card_image} alt={`${g.display_name}`} />
              </div>
              <div className="g-body">
                <div className="g-title">{g.display_name}</div>
                <div className="micro micro-faint">{g.descriptor.toUpperCase()}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="step-actions">
          <button
            className="btn btn-primary"
            disabled={!selected}
            onClick={() => router.push(`/create/colours?garment=${selected}`)}
          >
            Continue →
          </button>
        </div>
      </section>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="container"><Nav /></div>}>
      <GarmentStep />
    </Suspense>
  );
}
