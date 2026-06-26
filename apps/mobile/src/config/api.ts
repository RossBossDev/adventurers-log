const DEFAULT_API_BASE_URL = "https://osrs-log.rossboss.dev";

export function getApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const baseUrl = configuredUrl || DEFAULT_API_BASE_URL;

  return baseUrl.replace(/\/+$/, "");
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getApiBaseUrl()}${normalizedPath}`;
}
