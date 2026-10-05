"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STAGES = [
  { key: "reading_references", label: "Reading colour references" },
  { key: "composing", label: "Building your combination" },
  { key: "generating", label: "Creating visualisation" },
  { key: "finishing", label: "Applying latex finish" },
];

export default function StudyProgress({
  studyId,
  subtitle,
}: {
  studyId: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("queued");
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let stopped = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/studies/${studyId}`, { cache: "no-store" });
        const data = await res.json();
        if (stopped || !data.study) return;
        setStatus(data.study.status);
        if (data.study.status === "ready") {
          router.refresh();
          return;
        }
        if (data.study.status === "failed") {
          setError(data.study.error || "Generation failed");
          return;
        }
        setTimeout(poll, 900);
      } catch {
        if (!stopped) setTimeout(poll, 1500);
      }
    };
    poll();
    return () => {
      stopped = true;
    };
  }, [studyId, router]);

  const activeIdx = Math.max(
    0,
    STAGES.findIndex((s) => s.key === status),
  );

  const retry = async () => {
    setRetrying(true);
    try {
      const res = await fetch(`/api/studies/${studyId}/regenerate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Retry failed");
      router.push(`/study/${data.study_id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Retry failed");
      setRetrying(false);
    }
  };

  return (
    <div className="progress-wrap">
      <div className="micro micro-accent">03 — CREATE</div>
      <h1 style={{ fontSize: 34, fontWeight: 640, margin: "14px 0 8px" }}>
        Creating your Colour Study.
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 14.5, margin: 0 }}>
        {subtitle ?? "We're composing the study."}
      </p>

      <ul className="progress-list">
        {STAGES.map((s, i) => {
          const cls = i < activeIdx ? "done" : i === activeIdx ? "active" : "";
          return (
            <li key={s.key} className={`progress-item ${cls}`}>
              <span className="tick">{i < activeIdx ? "✓" : ""}</span>
              {s.label}
              {i === activeIdx && status !== "failed" && <span style={{ color: "var(--faint)" }}>…</span>}
            </li>
          );
        })}
      </ul>

      {error && (
        <>
          <div className="progress-error">
            The study couldn&apos;t be generated: {error}
          </div>
          <div className="study-actions">
            <button className="btn" onClick={retry} disabled={retrying}>
              {retrying ? "Retrying…" : "Try again"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
