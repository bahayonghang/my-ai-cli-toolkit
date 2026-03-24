import { describe, expect, it } from "vitest";
import { resolveStoredTargetFailure } from "./useInstallTarget";

describe("useInstallTarget helper", () => {
  it("keeps the project target and returns a blocking warning state", () => {
    const storedTarget = {
      scope: "project" as const,
      project_path: "/tmp/project",
    };

    const result = resolveStoredTargetFailure(
      storedTarget,
      "Project target is invalid",
      ((key: string) => key) as never,
    );

    expect(result.target).toEqual(storedTarget);
    expect(result.resolvedTarget).toBeNull();
    expect(result.resolutionError).toBe("Project target is invalid");
    expect(result.notificationMessage).toBe("installed.installTargetResolveBlocked");
    expect(result.notificationSeverity).toBe("warning");
  });
});
