import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SortTabs } from "@/components/SortTabs";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("SortTabs", () => {
  it("renders hot/trending/all_time tabs", () => {
    render(<SortTabs value="hot" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "marketplace.sort.hot" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "marketplace.sort.trending" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "marketplace.sort.all_time" })).toBeInTheDocument();
  });

  it("emits selected sort value on click", () => {
    const onChange = vi.fn();
    render(<SortTabs value="hot" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "marketplace.sort.trending" }));

    expect(onChange).toHaveBeenCalledWith("trending");
  });
});
