import { describe, expect, it } from "vitest";
import { messagesByLocale } from "./messages";

describe("messagesByLocale", () => {
  it("keeps zh/en key sets in sync", () => {
    const enKeys = Object.keys(messagesByLocale.en).sort();
    const zhKeys = Object.keys(messagesByLocale.zh).sort();
    expect(zhKeys).toEqual(enKeys);
  });
});
