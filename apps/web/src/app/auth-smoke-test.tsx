"use client";

import { useEffect, useState } from "react";

const AUTH_BASE = "/api/auth";

type LogEntry = {
  label: string;
  value: unknown;
  timestamp: string;
};

export function AuthSmokeTest() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (label: string, value: unknown) => {
    setLogs((current) => [
      { label, value, timestamp: new Date().toLocaleTimeString() },
      ...current,
    ]);
  };

  const run = async (label: string, action: () => Promise<unknown>) => {
    try {
      addLog(label, await action());
    } catch (error) {
      addLog(`${label} failed`, error);
    }
  };

  const callbackUrl = () => window.location.href.split("#")[0];

  const startSocialSignIn = (provider: "apple" | "google") =>
    run(`Continue with ${provider}`, async () => {
      const data = await post("/sign-in/social", {
        provider,
        callbackURL: callbackUrl(),
        errorCallbackURL: callbackUrl(),
        disableRedirect: true,
      });

      if (isRedirectResponse(data)) {
        window.location.href = data.url;
      }

      return data;
    });

  useEffect(() => {
    void get("/get-session")
      .then((value) => {
        setLogs((current) => [
          {
            label: "Initial session",
            value,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...current,
        ]);
      })
      .catch((error: unknown) => {
        setLogs((current) => [
          {
            label: "Initial session failed",
            value: error,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...current,
        ]);
      });
  }, []);

  return (
    <section className="grid gap-6 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
      <div>
        <h2 className="text-2xl font-semibold">Auth smoke test</h2>
        <p className="mt-2 text-sm text-slate-300">
          Temporary Better Auth test UI. Provider buttons are always shown; any
          missing provider configuration will appear in the log.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-full bg-white px-4 py-2 font-semibold text-slate-950"
          type="button"
          onClick={() => startSocialSignIn("google")}
        >
          Continue with Google
        </button>
        <button
          className="rounded-full bg-black px-4 py-2 font-semibold text-white ring-1 ring-slate-600"
          type="button"
          onClick={() => startSocialSignIn("apple")}
        >
          Continue with Apple
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_12rem_auto]">
        <label className="grid gap-1 text-sm font-medium text-slate-200">
          Email
          <input
            className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-slate-50"
            type="email"
            value={email}
            placeholder="you@example.com"
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-200">
          OTP
          <input
            className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-slate-50"
            value={otp}
            inputMode="numeric"
            placeholder="123456"
            autoComplete="one-time-code"
            onChange={(event) => setOtp(event.target.value)}
          />
        </label>
        <div className="flex items-end gap-3">
          <button
            className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-slate-950"
            type="button"
            onClick={() =>
              run("Send email OTP", () =>
                post("/email-otp/send-verification-otp", {
                  email,
                  type: "sign-in",
                }),
              )
            }
          >
            Send OTP
          </button>
          <button
            className="rounded-full bg-emerald-400 px-4 py-2 font-semibold text-slate-950"
            type="button"
            onClick={() =>
              run("Verify email OTP", () =>
                post("/sign-in/email-otp", { email, otp }),
              )
            }
          >
            Verify
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-full bg-sky-400 px-4 py-2 font-semibold text-slate-950"
          type="button"
          onClick={() => run("Get session", () => get("/get-session"))}
        >
          Get session
        </button>
        <button
          className="rounded-full bg-red-500 px-4 py-2 font-semibold text-white"
          type="button"
          onClick={() => run("Sign out", () => post("/sign-out", {}))}
        >
          Sign out
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Log</h3>
        <pre className="mt-2 min-h-56 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
          {logs.length > 0
            ? logs
                .map(
                  (entry) =>
                    `[${entry.timestamp}] ${entry.label}\n${renderLogValue(
                      entry.value,
                    )}`,
                )
                .join("\n\n")
            : "No auth calls yet."}
        </pre>
      </div>
    </section>
  );
}

async function post(path: string, body: unknown) {
  const response = await fetch(`${AUTH_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  return parseResponse(response);
}

async function get(path: string) {
  const response = await fetch(`${AUTH_BASE}${path}`, {
    credentials: "include",
  });

  return parseResponse(response);
}

async function parseResponse(response: Response) {
  const text = await response.text();
  const data = parseResponseBody(text);

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
}

function parseResponseBody(text: string) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function isRedirectResponse(value: unknown): value is { url: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "url" in value &&
    typeof value.url === "string"
  );
}

function renderLogValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}
