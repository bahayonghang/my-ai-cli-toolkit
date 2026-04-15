#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const DESCRIPTION_LIMIT = 80;
const MAP_INNER_WIDTH = 58;
const NAME_COLUMN_WIDTH = 22;
const DESC_COLUMN_WIDTH = 29;

const GROUPS = [
  {
    key: "cognitive-analysis",
    title: "◆ 认知与分析"
  },
  {
    key: "document-expression",
    title: "▲ 文档与表达"
  },
  {
    key: "development-implementation",
    title: "■ 开发与实现"
  },
  {
    key: "workflow-integration",
    title: "● 工作流与集成"
  },
  {
    key: "system-maintenance",
    title: "★ 系统与维护"
  },
  {
    key: "uncategorized",
    title: "· 未分类"
  }
];

const GROUP_RULES = [
  {
    key: "cognitive-analysis",
    pattern: /analy|research|read|paper|study|learn|summar|interpret/
  },
  {
    key: "document-expression",
    pattern: /write|card|slide|doc|screenshot|theme|format|present/
  },
  {
    key: "development-implementation",
    pattern: /code|build|debug|test|refactor|lint|api|tool|script/
  },
  {
    key: "workflow-integration",
    pattern: /workflow|sync|web|browser|fetch|search|agent|automation/
  },
  {
    key: "system-maintenance",
    pattern: /setup|install|config|memory|skill|meta|manage|review/
  }
];

export function defaultSkillRoots() {
  const home = os.homedir();
  return [
    path.join(home, ".claude", "skills"),
    path.join(home, ".agents", "skills")
  ];
}

function usage() {
  return [
    "Usage:",
    "  node scripts/skill-map.mjs",
    "  node scripts/skill-map.mjs --json",
    "  node scripts/skill-map.mjs --root <path> [--root <path> ...]",
    "",
    "Options:",
    "  --json          Emit structured JSON instead of the ASCII map",
    "  --root <path>   Scan only the provided root(s)",
    "  --help          Show this help text"
  ].join("\n");
}

export function expandHome(rawPath) {
  if (!rawPath) {
    return rawPath;
  }

  if (rawPath === "~") {
    return os.homedir();
  }

  if (rawPath.startsWith("~/") || rawPath.startsWith("~\\")) {
    return path.join(os.homedir(), rawPath.slice(2));
  }

  return rawPath;
}

function normalizeLineEndings(text) {
  return text.replace(/\r\n?/g, "\n");
}

function stripBom(text) {
  return text.replace(/^\uFEFF/, "");
}

function normalizeWhitespace(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMatchingQuotes(value) {
  const trimmed = String(value ?? "").trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function truncateText(text, limit) {
  const characters = Array.from(String(text ?? ""));
  if (characters.length <= limit) {
    return characters.join("");
  }
  if (limit <= 3) {
    return characters.slice(0, limit).join("");
  }
  return `${characters.slice(0, limit - 3).join("")}...`;
}

function buildDescriptionSummary(description) {
  const normalized = normalizeWhitespace(description);
  if (!normalized) {
    return "";
  }

  const sentenceBreak = normalized
    .split("。")[0]
    .split(/\. +/)[0]
    .trim();
  const summary = sentenceBreak || normalized;
  return truncateText(summary, DESCRIPTION_LIMIT);
}

function isTopLevelField(line) {
  return /^[A-Za-z_][A-Za-z0-9_-]*\s*:/.test(line);
}

function flushBlockField(target, key, style, lines) {
  const trimmedLines = lines.map((line) => line.replace(/^[ \t]+/, ""));
  let value = trimmedLines.join("\n");
  if (style === "folded") {
    value = normalizeWhitespace(value);
  }
  target[key] = value;
}

export function parseFrontmatter(content) {
  const normalized = stripBom(normalizeLineEndings(String(content ?? "")));
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) {
    return {};
  }

  const lines = match[1].split("\n");
  const result = {};
  let blockKey = null;
  let blockStyle = null;
  let blockLines = [];

  const closeBlockIfNeeded = () => {
    if (!blockKey) {
      return;
    }
    flushBlockField(result, blockKey, blockStyle, blockLines);
    blockKey = null;
    blockStyle = null;
    blockLines = [];
  };

  for (const line of lines) {
    if (blockKey) {
      if (isTopLevelField(line)) {
        closeBlockIfNeeded();
      } else {
        blockLines.push(line);
        continue;
      }
    }

    if (!isTopLevelField(line)) {
      continue;
    }

    const separatorIndex = line.indexOf(":");
    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trimStart();

    if (key === "description" && /^>[+-]?$/.test(rawValue)) {
      blockKey = key;
      blockStyle = "folded";
      blockLines = [];
      continue;
    }

    if (key === "description" && /^\|[+-]?$/.test(rawValue)) {
      blockKey = key;
      blockStyle = "literal";
      blockLines = [];
      continue;
    }

    result[key] = stripMatchingQuotes(rawValue);
  }

  closeBlockIfNeeded();
  return result;
}

function normalizeVersion(version) {
  const trimmed = String(version ?? "").trim();
  return trimmed ? trimmed : "-";
}

function normalizeInvocable(raw) {
  if (raw == null) {
    return null;
  }

  const value = String(raw).trim().toLowerCase();
  if (!value) {
    return null;
  }

  if (["true", "yes", "1"].includes(value)) {
    return true;
  }

  if (["false", "no", "0"].includes(value)) {
    return false;
  }

  return null;
}

export function inferGroupKey(name, description) {
  const haystack = `${name ?? ""} ${description ?? ""}`.toLowerCase();
  for (const rule of GROUP_RULES) {
    if (rule.pattern.test(haystack)) {
      return rule.key;
    }
  }
  return "uncategorized";
}

function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function listSkillDirectories(root) {
  try {
    return fs
      .readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

export function scanRoots(roots) {
  const resolvedRoots = roots.map((root) => path.resolve(expandHome(root)));
  const seenNames = new Set();
  const results = [];

  for (const root of resolvedRoots) {
    if (!fs.existsSync(root)) {
      continue;
    }

    let stat;
    try {
      stat = fs.statSync(root);
    } catch {
      continue;
    }

    if (!stat.isDirectory()) {
      continue;
    }

    const directories = listSkillDirectories(root);
    for (const dirName of directories) {
      const skillFile = path.join(root, dirName, "SKILL.md");
      if (!fs.existsSync(skillFile)) {
        continue;
      }

      const fileContent = safeReadFile(skillFile);
      if (fileContent == null) {
        continue;
      }

      const metadata = parseFrontmatter(fileContent);
      const name = String(metadata.name ?? dirName).trim() || dirName;
      if (seenNames.has(name)) {
        continue;
      }

      seenNames.add(name);

      const fullDescription = String(metadata.description ?? "");
      results.push({
        name,
        version: normalizeVersion(metadata.version),
        invocable: normalizeInvocable(metadata.user_invocable),
        desc: buildDescriptionSummary(fullDescription),
        source_category: String(metadata.category ?? "").trim(),
        group_key: inferGroupKey(name, fullDescription),
        install_root: root
      });
    }
  }

  return results.sort((left, right) =>
    left.name.localeCompare(right.name, undefined, {
      sensitivity: "base",
      numeric: true
    })
  );
}

function buildGroupMap(rows) {
  const grouped = new Map(GROUPS.map((group) => [group.key, []]));
  for (const row of rows) {
    grouped.get(row.group_key)?.push(row);
  }
  return grouped;
}

function makeBorder(left, fill, right) {
  return `${left}${fill.repeat(MAP_INNER_WIDTH)}${right}`;
}

function makeBoxLine(content = "") {
  const truncated = truncateText(content, MAP_INNER_WIDTH);
  return `║${truncated.padEnd(MAP_INNER_WIDTH, " ")}║`;
}

function makeTableBorder() {
  return `  +${"-".repeat(NAME_COLUMN_WIDTH)}+${"-".repeat(DESC_COLUMN_WIDTH)}+  `;
}

function makeCell(text, width) {
  const trimmed = truncateText(String(text ?? ""), width - 1);
  return ` ${trimmed.padEnd(width - 1, " ")}`;
}

function renderNameLabel(row) {
  const versionLabel = row.version === "-" ? "-" : `v${row.version}`;
  return `${row.name}${row.invocable === true ? "/" : ""} ${versionLabel}`;
}

export function renderSkillMap(rows) {
  const grouped = buildGroupMap(rows);
  const nonEmptyGroups = GROUPS.filter((group) => (grouped.get(group.key) ?? []).length > 0);
  const invocableCount = rows.filter((row) => row.invocable === true).length;
  const unknownCount = rows.filter((row) => row.invocable == null).length;
  const lines = [];

  lines.push(makeBorder("╔", "═", "╗"));
  lines.push(makeBoxLine(`             SKILL MAP  ·  ${rows.length} skills installed`));
  lines.push(makeBorder("╠", "═", "╣"));
  lines.push(makeBoxLine(""));

  if (rows.length === 0) {
    lines.push(makeBoxLine("  No installed skills found under configured skill roots"));
    lines.push(makeBoxLine(""));
  } else {
    for (const group of nonEmptyGroups) {
      lines.push(makeBoxLine(`  ${group.title}`));
      lines.push(makeBoxLine(makeTableBorder()));
      for (const row of grouped.get(group.key) ?? []) {
        lines.push(
          makeBoxLine(
            `  |${makeCell(renderNameLabel(row), NAME_COLUMN_WIDTH)}|${makeCell(
              row.desc || "无描述",
              DESC_COLUMN_WIDTH
            )}|  `
          )
        );
      }
      lines.push(makeBoxLine(makeTableBorder()));
      lines.push(makeBoxLine(""));
    }
  }

  lines.push(makeBorder("╠", "═", "╣"));
  lines.push(
    makeBoxLine(
      ` Total: ${rows.length}  Invocable: ${invocableCount}  Unknown: ${unknownCount}  Groups: ${nonEmptyGroups.length}`
    )
  );
  lines.push(makeBorder("╚", "═", "╝"));

  return lines.join("\n");
}

export function parseCliArgs(argv) {
  const options = {
    json: false,
    roots: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--root") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --root");
      }
      options.roots.push(next);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

export function runCli(argv = process.argv.slice(2)) {
  const options = parseCliArgs(argv);
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }

  const roots = options.roots.length > 0 ? options.roots : defaultSkillRoots();
  const rows = scanRoots(roots);

  if (options.json) {
    process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
  } else {
    process.stdout.write(`${renderSkillMap(rows)}\n`);
  }

  return 0;
}

const executedAsScript =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (executedAsScript) {
  try {
    process.exitCode = runCli();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
