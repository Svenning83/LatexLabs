"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AccessGate from "./AccessGate";
import GenerationOverlay from "./GenerationOverlay";

export default function StudyActions({
  studyId,
  garmentId,
  colourIds,
  colourNames,
}: {
  studyId: string;
  garmentId: string;
  colourIds: string[];
  colourNames?: string[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limited, setLimited] = useState(false);
  const [freeLimit, setFreeLimit] = useState(3);
  const [copied, setCopied] = useState(false);
  const [expectedSecs, setExpectedSecs] = useState(25);
  const [attempt, setAttempt] = useState(0);
  const posting = useRef(false);

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then((d) => {
      if (d.expected_seconds) setExpectedSecs(d.expected_seconds);
      if (typeof d.free_limit === "number") setFreeLimit(d.free_limit);
      if (!d.access_granted && typeof d.free_used === "number" && d.free_used >= (d.free_limit ?? 3)) {
        setLimited(true);
      }
    }).catch(() => {});
  }, []);

  const doPost = async () => {
    if (posting.current) return;
    posting.current = true;
    try {
      const res = await fetch(`/api/studies/${studyId}/regenerate`, { method: "POST" });
      const data = await res.json();
      if (res.status === 403 && data.error === "free_limit") {
        setFreeLimit(typeof data.free_limit === "number" ? data.free_limit : 3);
        setLimited(true);
        setBusy(false);
        return;
      }
      if (!res.ok || data.status === "failed") {
        throw new Error(data.error || "Regeneration failed");
      }
      router.push(`/study/${data.study_id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      posting.current = false;
    }
  };

  const regenerate = () => {
    setBusy(true);
    setError(null);
    void doPost();
  };

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this study link:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <>
    <div className="study-actions">
      <button className="btn btn-primary" onClick={regenerate} disabled={busy}>
        {busy ? "Regenerating…" : "Regenerate"}
      </button>
      <button
        className="btn"
        onClick={() => router.push(`/create/colours?garment=${garmentId}&colours=${colourIds.join(",")}`)}
      >
        Change colours
      </button>
      <button className="btn btn-ghost" onClick={share}>
        {copied ? "Link copied" : "Share"}
      </button>
      {busy && (
        <GenerationOverlay
          key={attempt}
          expectedSeconds={expectedSecs}
          subtitle={colourNames?.join(" · ")}
          error={error}
          onRetry={() => {
            setError(null);
            setAttempt((a) => a + 1);
            void doPost();
          }}
          onClose={() => {
            setBusy(false);
            setError(null);
          }}
        />
      )}
    </div>
    {limited && (
      <div style={{ marginTop: 16, maxWidth: 420 }}>
        <AccessGate
          limit={freeLimit}
          onUnlocked={() => {
            setLimited(false);
            setBusy(true);
            setError(null);
            void doPost();
          }}
        />
      </div>
    )}
    </>
  );
}
