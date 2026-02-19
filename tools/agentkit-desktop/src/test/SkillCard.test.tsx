import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillCard } from "@/components/SkillCard";
import type { MarketplaceSkill } from "@/types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const baseSkill: MarketplaceSkill = {
  id: "vercel-labs/skills/find-skills",
  name: "find-skills",
  owner: "vercel-labs",
  repo: "skills",
  skill: "find-skills",
  stars: 100,
  downloads: 200,
  categories: [],
  platforms: [],
  source: "vercel-labs/skills",
  installed: false,
};

describe("SkillCard", () => {
  it("builds skills.sh detail URL from owner/repo/skill", () => {
    render(<SkillCard skill={baseSkill} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://skills.sh/vercel-labs/skills/find-skills"
    );
  });

  it("encodes skill slug in detail URL", () => {
    render(
      <SkillCard
        skill={{
          ...baseSkill,
          id: "vercel-labs/skills/find skills",
          skill: "find skills",
        }}
      />
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://skills.sh/vercel-labs/skills/find%20skills"
    );
  });

  it("triggers install action when not installed", async () => {
    const user = userEvent.setup();
    const onInstall = vi.fn();

    render(<SkillCard skill={baseSkill} onInstall={onInstall} />);
    await user.click(screen.getByRole("button", { name: "marketplace.install" }));

    expect(onInstall).toHaveBeenCalledTimes(1);
  });
});
