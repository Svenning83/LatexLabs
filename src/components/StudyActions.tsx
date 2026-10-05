"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudyActions({
  studyId,
  garmentId,
  colourIds,
}: {
  studyId: string;
  garmentId: string;
  colourIds: string[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const regenerate = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/studies/${studyId}/regenerate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Regeneration failed");
      router.push(`/study/${data.study_id}`);
      router.refresh();
    } catch {
      setBusy(false);
    }
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
    </div>
  );
}
