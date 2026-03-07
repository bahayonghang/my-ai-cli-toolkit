import { afterEach, describe, expect, it, vi } from "vitest";
import { createTranslator, translate } from "./translator";

describe("translator", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

  afterEach(() => {
    errorSpy.mockClear();
  });

  it("interpolates variables", () => {
    const t = createTranslator("en");
    expect(t("common.selectedCount", { count: 3 })).toBe("3 selected");
  });

  it("returns explicit marker for missing keys", () => {
    const missing = translate("en", "missing.key");
    expect(missing).toBe("__MISSING_I18N__:missing.key");
    expect(errorSpy).toHaveBeenCalled();
  });

  it("keeps placeholder when interpolation vars are missing", () => {
    const t = createTranslator("en");
    const message = t("install.updateAll");
    expect(message).toContain("{count}");
    expect(errorSpy).toHaveBeenCalled();
  });
});
