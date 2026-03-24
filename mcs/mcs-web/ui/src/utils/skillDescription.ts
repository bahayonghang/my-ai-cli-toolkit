const markdownOnlyPattern = /^[`>*_\-+\s"'“”‘’.,:;!?()[\]{}\\/|]+$/;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripWrappedQuotes(value: string) {
  return value
    .replace(/^["'“”‘’]+\s*/, "")
    .replace(/\s*["'“”‘’]+$/, "");
}

function cleanMarkdownLine(line: string) {
  return line
    .replace(/^\s{0,3}(?:>\s*)+/, "")
    .replace(/^\s*[-*+]\s+/, "")
    .replace(/^\s*\d+\.\s+/, "")
    .trim();
}

function truncateAtWordBoundary(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const sliced = value.slice(0, maxLength - 1).trimEnd();
  const lastSpace = sliced.lastIndexOf(" ");
  const compact = lastSpace >= maxLength * 0.55 ? sliced.slice(0, lastSpace) : sliced;
  return `${compact.trimEnd()}…`;
}

export function sanitizeSkillDescription(input: string | null | undefined): string | null {
  if (!input) {
    return null;
  }

  const normalizedInput = input.replace(/\r\n/g, "\n").trim();
  if (!normalizedInput) {
    return null;
  }

  const cleanedLines = normalizedInput
    .split("\n")
    .map((line) => cleanMarkdownLine(line))
    .filter(Boolean);

  const normalized = normalizeWhitespace(stripWrappedQuotes(cleanedLines.join(" ")));
  if (!normalized || markdownOnlyPattern.test(normalized)) {
    return null;
  }

  return normalized;
}

export function summarizeSkillDescription(
  input: string | null | undefined,
  mode: "list" | "detail",
): string {
  const sanitized = sanitizeSkillDescription(input);
  if (!sanitized) {
    return "";
  }

  if (mode === "detail") {
    return sanitized;
  }

  return truncateAtWordBoundary(sanitized, 180);
}
