import { buildApiUrl } from "../config/api";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
};

export type AuthSession = {
  id?: string;
  token?: string;
  expiresAt?: string | Date;
};

export type AuthSessionResponse = {
  session: AuthSession | null;
  user: AuthUser | null;
};

export type SocialProvider = "apple" | "google";

export type SocialSignInResponse = AuthSessionResponse & {
  token: string;
  redirect?: boolean;
  url?: string;
};

const AUTH_ORIGIN = "adventurerslog://auth";

export async function signInWithSocialToken(input: {
  provider: SocialProvider;
  idToken: unknown;
  sessionToken?: string | null;
}): Promise<SocialSignInResponse> {
  const data = await authRequest<unknown>("/api/auth/sign-in/social", {
    method: "POST",
    sessionToken: input.sessionToken,
    body: {
      provider: input.provider,
      idToken: input.idToken,
      disableRedirect: true,
    },
  });

  return normalizeSignInResponse(data);
}

export async function sendEmailOtp(input: {
  email: string;
  sessionToken?: string | null;
}) {
  await authRequest<unknown>("/api/auth/email-otp/send-verification-otp", {
    method: "POST",
    sessionToken: input.sessionToken,
    body: { email: input.email, type: "sign-in" },
  });
}

export async function signInWithEmailOtp(input: {
  email: string;
  otp: string;
  sessionToken?: string | null;
}): Promise<SocialSignInResponse> {
  const data = await authRequest<unknown>("/api/auth/sign-in/email-otp", {
    method: "POST",
    sessionToken: input.sessionToken,
    body: { email: input.email, otp: input.otp },
  });

  return normalizeSignInResponse(data);
}

export async function getSession(sessionToken: string) {
  return authRequest<AuthSessionResponse>("/api/auth/get-session", {
    method: "GET",
    sessionToken,
  });
}

export async function signOut(sessionToken?: string | null) {
  await authRequest<unknown>("/api/auth/sign-out", {
    method: "POST",
    sessionToken,
    body: {},
  });
}

async function authRequest<T>(
  path: string,
  options: {
    method: "GET" | "POST";
    body?: unknown;
    sessionToken?: string | null;
  },
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Origin: AUTH_ORIGIN,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.sessionToken) {
    headers.Authorization = `Bearer ${options.sessionToken}`;
  }

  const response = await fetch(buildApiUrl(path), {
    method: options.method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  const data = parseJson(text);

  if (!response.ok) {
    throw new Error(readErrorMessage(data, response.status));
  }

  return data as T;
}

function normalizeSignInResponse(data: unknown): SocialSignInResponse {
  const record = asRecord(data);
  const session = asRecord(record.session);
  const token = readString(record.token) ?? readString(session.token);

  if (!token) {
    throw new Error(
      "Sign in succeeded, but the server did not return a session token.",
    );
  }

  return {
    token,
    redirect: Boolean(record.redirect),
    url: readString(record.url),
    session: (session as AuthSession | null) ?? null,
    user: (asRecord(record.user) as AuthUser | null) ?? null,
  };
}

function parseJson(text: string) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function readErrorMessage(data: unknown, status: number) {
  const record = asRecord(data);
  const message =
    readString(record.message) ??
    readString(record.error) ??
    readString(asRecord(record.data).message);

  return message ?? `Auth request failed (${status}).`;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}
