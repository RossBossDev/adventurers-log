"use client";

import { useEffect, useState } from "react";

type HealthState = "loading" | "healthy" | "unhealthy";

export function ApiHealth() {
  const [state, setState] = useState<HealthState>("loading");

  useEffect(() => {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

    fetch(`${apiBaseUrl}/health`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Health check failed with ${response.status}`);
        }
        return response.json();
      })
      .then(() => setState("healthy"))
      .catch(() => setState("unhealthy"));
  }, []);

  return (
    <p
      data-testid="api-health"
      className="rounded-full border border-emerald-500/30 px-4 py-2 text-sm text-emerald-200"
    >
      Backend health: {state}
    </p>
  );
}
