"use client";

import { useEffect, useState } from "react";

// Mirrors the real pipeline stages; only "generating" has unknown duration,
// so stage positions are fractions of the calibrated expected_seconds.
const STAGES = [
  { label: "Reading colour references", until: 0.06 },
  { label: "Building your combination", until: 0.16 },
  { label: "Creating visualisation", until: 0.9 },
  { label: "Applying latex finish", until: 1 },
];

export default function GenerationOverlay({
  expectedSeconds = 25,
  subtitle,
  error = null,
  onRetry,
  onClose,
}: {
  expectedSeconds?: number;
  subtitle?: string;
  error?: string | null;
  onRetry?: () => void;
  onClose?: () => void;
}) {
  const [p, setP] = useState(0);

  useEffect(() => {
    if (error) return;
    const t0 = Date.now();
    const id = setInterval(() => {
      const t = (Date.now() - t0) / 1000 / expectedSeconds;
      // ~linear to 92% over the estimate, then crawl toward 97%
      setP(t < 1 ? t * 0.92 : Math.min(0.97, 0.92 + (t - 1) * 0.02));
    }, 150);
    return () => clearInterval(id);
  }, [expectedSeconds, error]);

  const idx = STAGES.findIndex((s) => p < s.until);
  const activeIdx = idx === -1 ? STAGES.length - 1 : idx;

  return (
    <div className="gen-overlay">
      <div className="gen-card">
        <div className="micro micro-accent">03 — CREATE</div>
        <h1 className="gen-title">Creating your Colour Study.</h1>
        {subtitle && <p className="gen-sub">{subtitle}</p>}

        <ul className="progress-list">
          {STAGES.map((s, i) => {
            const cls = i < activeIdx ? "done" : i === activeIdx ? "active" : "";
            return (
              <li key={s.label} className={`progress-item ${cls}`}>
                <span className="tick">{i < activeIdx ? "✓" : ""}</span>
                {s.label}
                {i === activeIdx && !error && (
                  <span style={{ color: "var(--faint)" }}>…</span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="gen-track">
          <div className="gen-bar" style={{ width: `${p * 100}%` }} />
        </div>
        <div className="gen-eta">
          Usually takes ~{expectedSeconds} seconds.
        </div>

        {error && (
          <>
            <div className="progress-error">
              The study couldn&apos;t be generated: {error}
            </div>
            <div className="study-actions">
              {onRetry && (
                <button className="btn" onClick={onRetry}>
                  Try again
                </button>
              )}
              {onClose && (
                <button className="btn btn-ghost" onClick={onClose}>
                  Back
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
