import { describe, expect, it } from "vitest";
import { extractInvalidPlatforms } from "./errorDetails";

describe("extractInvalidPlatforms", () => {
  it("returns empty array for invalid input", () => {
    expect(extractInvalidPlatforms(undefined)).toEqual([]);
    expect(extractInvalidPlatforms(null)).toEqual([]);
    expect(extractInvalidPlatforms("bad")).toEqual([]);
  });

  it("extracts platform ids from details payload", () => {
    const details = {
      invalid_platforms: ["antigravity", "codex", 123],
    };
    expect(extractInvalidPlatforms(details)).toEqual(["antigravity", "codex"]);
  });
});

