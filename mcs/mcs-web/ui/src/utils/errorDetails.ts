export function extractInvalidPlatforms(details: unknown): string[] {
  if (!details || typeof details !== "object") {
    return [];
  }
  const value = (details as { invalid_platforms?: unknown }).invalid_platforms;
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

