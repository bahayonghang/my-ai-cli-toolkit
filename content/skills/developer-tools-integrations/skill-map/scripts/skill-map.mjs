#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  defaultSkillRoots as resolveDefaultSkillRoots,
  loadPlatformConfigs,
  normalizePlatformId,
  rootLabelForPath
} from "./lib/platforms.mjs";
import { analyzeSkills, SCORE_THRESHOLDS, tokenizeForSimilarity } from "./lib/similarity.mjs";

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
    priority: 4,
    keywords: new Set([
      "analysis", "analyze", "analyses", "research", "read", "reading", "reader",
      "paper", "papers", "study", "studies", "learn", "learning",
      "summary", "summaries", "summarize", "interpret", "explain",
      "论文", "研究", "学习", "总结", "解释"
    ])
  },
  {
    key: "document-expression",
    priority: 3,
    keywords: new Set([
      "write", "writing", "writer", "document", "documentation", "docs",
      "card", "cards", "slide", "slides", "screenshot", "screenshots",
      "theme", "themes", "format", "formatting", "present", "presentation",
      "presentations", "article", "articles", "blog", "blogs",
      "文档", "写作", "截图", "主题", "排版", "文章", "幻灯片"
    ])
  },
  {
    key: "development-implementation",
    priority: 2,
    keywords: new Set([
      "code", "coding", "build", "building", "debug", "debugging",
      "test", "tests", "testing", "refactor", "refactoring", "lint",
      "api", "apis", "script", "scripts", "cli", "git", "commit", "commits",
      "开发", "构建", "调试", "测试", "脚本", "提交"
    ])
  },
  {
    key: "workflow-integration",
    priority: 1,
    keywords: new Set([
      "workflow", "workflows", "sync", "web", "browser", "browsers",
      "fetch", "search", "automation", "integrate", "integration", "integrations",
      "联网", "浏览器", "同步", "自动化", "集成", "搜索"
    ])
  },
  {
    key: "system-maintenance",
    priority: 0,
    keywords: new Set([
      "setup", "install", "installed", "config", "configuration",
      "memory", "meta", "manage", "management", "inventory", "map",
      "duplicate", "duplicates", "deduplicate", "cleanup", "stocktake",
      "安装", "配置", "管理", "盘点", "地图", "重复", "去重", "清理"
    ])
  }
];

function usage() {
  return [
    "Usage:",
    "  node scripts/skill-map.mjs",
    "  node scripts/skill-map.mjs --json",
    "  node scripts/skill-map.mjs --analyze",
    "  node scripts/skill-map.mjs --analyze --json --min-score 0.4",
    "  node scripts/skill-map.mjs --platform codex",
    "  node scripts/skill-map.mjs --root <path> [--root <path> ...]",
    "",
    "Options:",
    "  --json             Emit structured JSON instead of the ASCII map",
    "  --platform <id>    Force a platform-specific installed-skills root",
    "  --root <path>      Scan only the provided root(s)",
    "  --analyze          Render a similarity report (suggestions only, never deletes)",
    "  --min-score <num>  Minimum Jaccard score for the report (default 0.3, range 0–1)",
    "  --help             Show this help text"
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

export function defaultSkillRoots(options = {}) {
  return resolveDefaultSkillRoots(options);
}

function countKeywordMatches(tokens, keywords) {
  let matches = 0;
  const matched = new Set();
  for (const token of tokens) {
    if (keywords.has(token) && !matched.has(token)) {
      matched.add(token);
      matches += 1;
    }
  }
  return matches;
}

export function inferGroupKey(name, description) {
  const nameTokens = tokenizeForSimilarity(name);
  const descriptionTokens = tokenizeForSimilarity(description);
  let bestRule = null;

  for (const rule of GROUP_RULES) {
    const score =
      countKeywordMatches(nameTokens, rule.keywords) * 3
      + countKeywordMatches(descriptionTokens, rule.keywords);

    if (score === 0) {
      continue;
    }

    if (
      bestRule == null
      || score > bestRule.score
      || (score === bestRule.score && rule.priority < bestRule.priority)
    ) {
      bestRule = {
        key: rule.key,
        priority: rule.priority,
        score
      };
    }
  }

  return bestRule?.key ?? "uncategorized";
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

function buildInstanceId(root, dirName) {
  return `${root.replace(/\\/g, "/")}::${dirName}`;
}

function sortRows(left, right) {
  const nameComparison = left.name.localeCompare(right.name, undefined, {
    sensitivity: "base",
    numeric: true
  });
  if (nameComparison !== 0) {
    return nameComparison;
  }

  const rootComparison = left.install_root.localeCompare(right.install_root, undefined, {
    sensitivity: "base",
    numeric: true
  });
  if (rootComparison !== 0) {
    return rootComparison;
  }

  return left.instance_id.localeCompare(right.instance_id, undefined, {
    sensitivity: "base",
    numeric: true
  });
}

export function scanRoots(roots) {
  const resolvedRoots = roots.map((root) => path.resolve(expandHome(root)));
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
      const fullDescription = String(metadata.description ?? "");
      results.push({
        instance_id: buildInstanceId(root, dirName),
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

  return results.sort(sortRows);
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

function duplicateNameSet(rows) {
  const counts = new Map();
  for (const row of rows) {
    counts.set(row.name, (counts.get(row.name) ?? 0) + 1);
  }
  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name]) => name)
  );
}

function decorateRowsForDisplay(rows) {
  const duplicateNames = duplicateNameSet(rows);
  const configs = loadPlatformConfigs();
  return rows.map((row) => ({
    ...row,
    display_name: duplicateNames.has(row.name)
      ? `${row.name}@${rootLabelForPath(row.install_root, configs)}`
      : row.name
  }));
}

function renderNameLabel(row) {
  const versionLabel = row.version === "-" ? "-" : `v${row.version}`;
  return `${row.display_name}${row.invocable === true ? "/" : ""} ${versionLabel}`;
}

export function renderSkillMap(rows) {
  const displayRows = decorateRowsForDisplay(rows);
  const grouped = buildGroupMap(displayRows);
  const nonEmptyGroups = GROUPS.filter((group) => (grouped.get(group.key) ?? []).length > 0);
  const invocableCount = displayRows.filter((row) => row.invocable === true).length;
  const unknownCount = displayRows.filter((row) => row.invocable == null).length;
  const lines = [];

  lines.push(makeBorder("╔", "═", "╗"));
  lines.push(makeBoxLine(`             SKILL MAP  ·  ${displayRows.length} skills installed`));
  lines.push(makeBorder("╠", "═", "╣"));
  lines.push(makeBoxLine(""));

  if (displayRows.length === 0) {
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
      ` Total: ${displayRows.length}  Invocable: ${invocableCount}  Unknown: ${unknownCount}  Groups: ${nonEmptyGroups.length}`
    )
  );
  lines.push(makeBorder("╚", "═", "╝"));

  return lines.join("\n");
}

const SIMILARITY_SECTIONS = [
  { action: "likely-duplicate", title: "▲ 疑似重复 (likely-duplicate)" },
  { action: "consider-merge", title: "◆ 建议合并 (consider-merge)" },
  { action: "review", title: "· 人工复查 (review)" }
];

function formatClusterRows(cluster) {
  const rows = [];
  const scoreLabel = `score ${cluster.max_score.toFixed(2)}`;
  rows.push({ left: cluster.members[0]?.display_name ?? "", right: scoreLabel });

  const tail = cluster.members.slice(1);
  const sharedSummary = cluster.shared_tokens.length > 0
    ? `共享: ${cluster.shared_tokens.slice(0, 4).join(", ")}`
    : "共享: —";

  if (tail.length === 0) {
    rows.push({ left: "", right: sharedSummary });
    return rows;
  }

  rows.push({ left: tail[0]?.display_name ?? "", right: sharedSummary });
  for (let i = 1; i < tail.length; i += 1) {
    rows.push({ left: tail[i]?.display_name ?? "", right: "" });
  }
  return rows;
}

export function renderSimilarityReport(analysis) {
  const lines = [];
  const clusterCount = analysis?.clusters?.length ?? 0;

  lines.push(makeBorder("╔", "═", "╗"));
  lines.push(
    makeBoxLine(`       SKILL SIMILARITY REPORT  ·  ${clusterCount} clusters`)
  );
  lines.push(makeBorder("╠", "═", "╣"));
  lines.push(makeBoxLine(""));

  if (clusterCount === 0) {
    const thresholdLabel = typeof analysis?.threshold === "number"
      ? analysis.threshold.toFixed(2)
      : SCORE_THRESHOLDS.review.toFixed(2);
    lines.push(
      makeBoxLine(
        `  No similar skills detected above threshold ${thresholdLabel}`
      )
    );
    lines.push(makeBoxLine(""));
  } else {
    for (const section of SIMILARITY_SECTIONS) {
      const sectionClusters = analysis.clusters.filter(
        (cluster) => cluster.action === section.action
      );
      if (sectionClusters.length === 0) {
        continue;
      }

      lines.push(makeBoxLine(`  ${section.title}`));
      lines.push(makeBoxLine(makeTableBorder()));
      for (const cluster of sectionClusters) {
        for (const { left, right } of formatClusterRows(cluster)) {
          lines.push(
            makeBoxLine(
              `  |${makeCell(left, NAME_COLUMN_WIDTH)}|${makeCell(right, DESC_COLUMN_WIDTH)}|  `
            )
          );
        }
      }
      lines.push(makeBoxLine(makeTableBorder()));
      lines.push(makeBoxLine(""));
    }
  }

  lines.push(makeBorder("╠", "═", "╣"));
  const summary = analysis?.summary ?? {};
  const totalSkills = summary.total_skills ?? 0;
  const skillsInClusters = summary.skills_in_clusters ?? 0;
  lines.push(
    makeBoxLine(
      ` Clusters: ${clusterCount}  Skills in clusters: ${skillsInClusters} / ${totalSkills}`
    )
  );
  lines.push(
    makeBoxLine(
      "  Suggestions only — this tool never deletes, moves, or archives files."
    )
  );
  lines.push(makeBorder("╚", "═", "╝"));

  return lines.join("\n");
}

export function parseCliArgs(argv) {
  const options = {
    json: false,
    roots: [],
    platform: "",
    analyze: false,
    minScore: null
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
    if (arg === "--analyze") {
      options.analyze = true;
      continue;
    }
    if (arg === "--platform") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --platform");
      }
      options.platform = normalizePlatformId(next);
      if (!options.platform) {
        throw new Error(`Unsupported platform value: ${JSON.stringify(next)}`);
      }
      index += 1;
      continue;
    }
    if (arg === "--min-score") {
      const next = argv[index + 1];
      if (next == null) {
        throw new Error("Missing value for --min-score");
      }
      const parsed = Number(next);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
        throw new Error(`--min-score must be a number in [0, 1], got ${JSON.stringify(next)}`);
      }
      options.minScore = parsed;
      index += 1;
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

function resolveSelectedRoots(options) {
  if (options.roots.length > 0) {
    return options.roots;
  }

  if (options.platform) {
    const configs = loadPlatformConfigs();
    const config = configs[options.platform];
    if (!config) {
      throw new Error(`Unsupported platform id: ${JSON.stringify(options.platform)}`);
    }
    return [path.resolve(expandHome(config.skills_base_dir || config.base_dir), config.skills_subdir || "skills")];
  }

  return defaultSkillRoots({
    env: process.env
  });
}

export function runCli(argv = process.argv.slice(2)) {
  const options = parseCliArgs(argv);
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }

  const roots = resolveSelectedRoots(options);
  const rows = scanRoots(roots);

  if (options.analyze) {
    const threshold = options.minScore ?? SCORE_THRESHOLDS.review;
    const analysis = analyzeSkills(decorateRowsForDisplay(rows), { threshold });
    if (options.json) {
      process.stdout.write(`${JSON.stringify(analysis, null, 2)}\n`);
    } else {
      process.stdout.write(`${renderSimilarityReport(analysis)}\n`);
    }
    return 0;
  }

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
