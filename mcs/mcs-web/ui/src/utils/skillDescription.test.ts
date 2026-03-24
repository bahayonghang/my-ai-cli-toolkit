import { describe, expect, it } from "vitest";
import {
  sanitizeSkillDescription,
  summarizeSkillDescription,
} from "./skillDescription";

describe("skillDescription", () => {
  it("returns null for empty or markdown-only content", () => {
    expect(sanitizeSkillDescription(null)).toBeNull();
    expect(sanitizeSkillDescription("   ")).toBeNull();
    expect(sanitizeSkillDescription(">")).toBeNull();
    expect(sanitizeSkillDescription('">-"')).toBeNull();
  });

  it("strips markdown prefixes and wrapped quotes", () => {
    expect(
      sanitizeSkillDescription(
        `"Paper reader for non-academics.\n> Takes a paper and extracts its ideas."`,
      ),
    ).toBe("Paper reader for non-academics. Takes a paper and extracts its ideas.");
  });

  it("keeps detail mode intact after sanitizing", () => {
    const description =
      '"Paper workflow: read papers + cast cards in one go. Use when user says paper flow."';

    expect(summarizeSkillDescription(description, "detail")).toBe(
      "Paper workflow: read papers + cast cards in one go. Use when user says paper flow.",
    );
  });

  it("truncates list mode at a readable boundary", () => {
    const description =
      "Paper reader for non-academics. Takes a paper and extracts its ideas for personal use. Focuses on understanding, not academic critique. Use when a user shares a paper URL or asks to understand a paper in plain language.";

    expect(summarizeSkillDescription(description, "list")).toMatch(/…$/);
    expect(summarizeSkillDescription(description, "list").length).toBeLessThanOrEqual(180);
  });
});
