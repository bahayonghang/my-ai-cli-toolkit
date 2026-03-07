import { describe, expect, it } from "vitest";
import { resolveInitialLocale } from "./locale";

describe("resolveInitialLocale", () => {
  it("prefers stored locale when valid", () => {
    expect(resolveInitialLocale("zh", "en-US")).toBe("zh");
    expect(resolveInitialLocale("en", "zh-CN")).toBe("en");
  });

  it("uses browser language when no valid stored locale", () => {
    expect(resolveInitialLocale(null, "zh-CN")).toBe("zh");
    expect(resolveInitialLocale(undefined, "zh-TW")).toBe("zh");
    expect(resolveInitialLocale(null, "en-US")).toBe("en");
  });

  it("falls back to en for unknown values", () => {
    expect(resolveInitialLocale("fr", "fr-FR")).toBe("en");
    expect(resolveInitialLocale(null, undefined)).toBe("en");
  });
});
