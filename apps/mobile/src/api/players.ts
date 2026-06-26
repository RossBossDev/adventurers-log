import { buildApiUrl } from "../config/api";

export type BackendTrackedPlayer = {
  id: string;
  normalized_username: string;
  created_at: string;
  updated_at: string;
};

type BackendErrorResponse = {
  message?: string | string[];
  error?: string;
};

function formatBackendMessage(body: unknown) {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const response = body as BackendErrorResponse;

  if (Array.isArray(response.message)) {
    return response.message.join(" ");
  }

  return response.message || response.error;
}

export async function findOrCreateTrackedPlayer(
  userName: string,
): Promise<BackendTrackedPlayer> {
  const url = buildApiUrl(`/api/player/name/${encodeURIComponent(userName)}`);
  const response = await fetch(url);

  if (!response.ok) {
    let body: unknown;

    try {
      body = await response.json();
    } catch {
      body = undefined;
    }

    const message = formatBackendMessage(body);
    throw new Error(
      message || `Could not track that player (${response.status}). Try again.`,
    );
  }

  return response.json() as Promise<BackendTrackedPlayer>;
}
