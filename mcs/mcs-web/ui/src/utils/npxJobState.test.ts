import { describe, expect, it } from "vitest";
import { finalizeInterruptedJob } from "./npxJobState";

describe("finalizeInterruptedJob", () => {
  it("marks pending and running items as failed while preserving successes", () => {
    const result = finalizeInterruptedJob(
      [
        {
          id: "0",
          label: "alpha",
          status: "success",
          output: "ok",
          error: null,
          durationMs: 12,
        },
        {
          id: "1",
          label: "beta",
          status: "running",
          output: "",
          error: null,
          durationMs: null,
        },
        {
          id: "2",
          label: "gamma",
          status: "pending",
          output: "",
          error: "existing failure",
          durationMs: null,
        },
      ],
      "stream disconnected"
    );

    expect(result.successCount).toBe(1);
    expect(result.failureCount).toBe(2);
    expect(result.completed).toBe(3);
    expect(result.percent).toBe(100);
    expect(result.items[0].status).toBe("success");
    expect(result.items[1]).toMatchObject({
      status: "error",
      error: "stream disconnected",
    });
    expect(result.items[2]).toMatchObject({
      status: "error",
      error: "existing failure",
    });
  });
});
