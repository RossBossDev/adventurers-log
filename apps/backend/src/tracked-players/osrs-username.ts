export class InvalidOsrsUsernameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOsrsUsernameError";
  }
}

export class UntrackableOsrsUsernameError extends Error {
  constructor(username: string) {
    super(`OSRS username "${username}" is not available to be tracked.`);
    this.name = "UntrackableOsrsUsernameError";
  }
}

const VALID_NORMALIZED_USERNAME = /^[a-z0-9 ]+$/;

export function normalizeOsrsUsername(input: string): string {
  const normalized = input
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\s+/g, " ");

  if (normalized.length === 0) {
    throw new InvalidOsrsUsernameError("OSRS username must not be empty.");
  }

  if (normalized.length > 12) {
    throw new InvalidOsrsUsernameError(
      "OSRS username must be 12 characters or fewer.",
    );
  }

  if (!VALID_NORMALIZED_USERNAME.test(normalized)) {
    throw new InvalidOsrsUsernameError(
      "OSRS username may only contain letters, digits, spaces, or underscores.",
    );
  }

  return normalized;
}
