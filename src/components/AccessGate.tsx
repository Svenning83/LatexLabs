"use client";

import { useState } from "react";

export default function AccessGate({
  limit,
  onUnlocked,
}: {
  limit: number;
  onUnlocked: () => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy || !code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        onUnlocked();
      } else {
        setError("That code didn't work.");
      }
    } catch {
      setError("Couldn't check the code - try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="access-gate">
      <div className="micro micro-faint">FREE LIMIT REACHED</div>
      <p className="access-gate-copy">
        You&apos;ve used your {limit} free colour {limit === 1 ? "study" : "studies"}.
        Enter an access code to keep creating.
      </p>
      <div className="access-gate-row">
        <input
          className="cp-search"
          placeholder="Access code"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
        />
        <button className="btn btn-primary" onClick={() => void submit()} disabled={busy || !code.trim()}>
          {busy ? "Checking…" : "Unlock"}
        </button>
      </div>
      {error && <div className="micro access-gate-err">{error}</div>}
    </div>
  );
}
