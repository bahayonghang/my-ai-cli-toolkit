/**
 * Error Utilities Tests
 */

import { describe, it, expect } from "vitest";
import { toUserFriendlyError, formatErrorForLog } from "../utils/errorUtils";

describe("toUserFriendlyError", () => {
  it("handles network errors", () => {
    const error = new Error("network request failed");
    const result = toUserFriendlyError(error);

    expect(result.title).toBe("Connection Error");
    expect(result.recoverable).toBe(true);
  });

  it("handles permission errors", () => {
    const error = new Error("EACCES: permission denied");
    const result = toUserFriendlyError(error);

    expect(result.title).toBe("Permission Denied");
    expect(result.recoverable).toBe(false);
  });

  it("handles file not found errors", () => {
    const error = new Error("ENOENT: no such file or directory");
    const result = toUserFriendlyError(error);

    expect(result.title).toBe("File Not Found");
    expect(result.recoverable).toBe(false);
  });

  it("handles symlink errors", () => {
    const error = new Error("symlink creation failed");
    const result = toUserFriendlyError(error);

    expect(result.title).toBe("Link Creation Failed");
    expect(result.recoverable).toBe(true);
  });

  it("handles npm errors", () => {
    const error = new Error("npm ERR! code ENOENT");
    const result = toUserFriendlyError(error);

    expect(result.title).toBe("npm Error");
    expect(result.suggestion).toContain("npm");
  });

  it("handles pip errors", () => {
    const error = new Error("pip install failed");
    const result = toUserFriendlyError(error);

    expect(result.title).toBe("pip Error");
    expect(result.suggestion).toContain("pip");
  });

  it("handles git errors", () => {
    const error = new Error("git clone failed");
    const result = toUserFriendlyError(error);

    expect(result.title).toBe("Git Error");
    expect(result.suggestion).toContain("git");
  });

  it("handles database errors", () => {
    const error = new Error("sqlite error: database is locked");
    const result = toUserFriendlyError(error);

    expect(result.title).toBe("Database Error");
    expect(result.recoverable).toBe(true);
  });

  it("handles unknown errors with default message", () => {
    const error = new Error("some random error");
    const result = toUserFriendlyError(error);

    expect(result.title).toBe("An Error Occurred");
    expect(result.message).toBe("some random error");
    expect(result.recoverable).toBe(true);
  });

  it("includes context in title when provided", () => {
    const error = new Error("some error");
    const result = toUserFriendlyError(error, "ResourceList");

    expect(result.title).toBe("Error in ResourceList");
  });

  it("handles non-Error objects", () => {
    const result = toUserFriendlyError("string error");

    expect(result.message).toBe("string error");
  });

  it("handles null/undefined", () => {
    const result = toUserFriendlyError(null);

    expect(result.message).toBe("null");
  });
});

describe("formatErrorForLog", () => {
  it("formats error with timestamp", () => {
    const error = new Error("test error");
    const result = formatErrorForLog(error);

    expect(result).toMatch(/^\[\d{4}-\d{2}-\d{2}T/);
    expect(result).toContain("Error: test error");
  });

  it("includes context when provided", () => {
    const error = new Error("test error");
    const result = formatErrorForLog(error, "TestContext");

    expect(result).toContain("Context: TestContext");
  });

  it("includes stack trace for Error objects", () => {
    const error = new Error("test error");
    const result = formatErrorForLog(error);

    expect(result).toContain("Stack:");
  });

  it("handles non-Error objects", () => {
    const result = formatErrorForLog("string error");

    expect(result).toContain("Error: string error");
    expect(result).not.toContain("Stack:");
  });
});
