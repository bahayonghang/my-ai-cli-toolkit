import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const DEFAULT_PLATFORM_ID = "claude";

const REPO_PLATFORMS_TOML = new URL("../../../../../../platforms.toml", import.meta.url);

const UNIVERSAL_SHARED_SKILLS_PLATFORM_IDS = Object.freeze([
  "amp",
  "cline",
  "codex",
  "cursor",
  "copilot",
  "kimi",
  "opencode"
]);

const DEFAULT_PLATFORM_CONFIGS = Object.freeze({
  claude: { base_dir: "~/.claude", skills_subdir: "skills" },
  amp: { base_dir: "~/.amp", skills_base_dir: "~/.agents", skills_subdir: "skills" },
  cline: { base_dir: "~/.cline", skills_base_dir: "~/.agents", skills_subdir: "skills" },
  codex: { base_dir: "~/.codex", skills_base_dir: "~/.agents", skills_subdir: "skills" },
  cursor: { base_dir: "~/.cursor", skills_base_dir: "~/.agents", skills_subdir: "skills" },
  copilot: { base_dir: "~/.copilot", skills_base_dir: "~/.agents", skills_subdir: "skills" },
  kimi: { base_dir: "~/.kimi", skills_base_dir: "~/.agents", skills_subdir: "skills" },
  qwen: { base_dir: "~/.qwen", skills_subdir: "skills" },
  kiro: { base_dir: "~/.kiro", skills_subdir: "skills" },
  qoder: { base_dir: "~/.qoder", skills_subdir: "skills" },
  trae: { base_dir: "~/.trae", skills_subdir: "skills" },
  "trae-cn": { base_dir: "~/.trae-cn", skills_subdir: "skills" },
  opencode: { base_dir: "~/.config/opencode", skills_base_dir: "~/.agents", skills_subdir: "skills" },
  antigravity: { base_dir: "~/.gemini/antigravity", skills_subdir: "skills" },
  windsurf: { base_dir: "~/.codeium/windsurf", skills_subdir: "skills" }
});

const PLATFORM_ALIASES = Object.freeze({
  "claude-code": "claude",
  claudecode: "claude",
  claude_code: "claude",
  "codex-cli": "codex",
  "qwen-code": "qwen",
  "kiro-cli": "kiro",
  qodercli: "qoder",
  opencodecli: "opencode",
  "trae_cn": "trae-cn",
  universal: "codex"
});

const PLATFORM_ENV_SIGNALS = Object.freeze([
  {
    id: "codex",
    test(env) {
      return envHasPrefix(env, "CODEX_")
        || containsValue(env.OMX_ENTRY_PATH, ["oh-my-codex", "codex"]);
    }
  },
  {
    id: "claude",
    test(env) {
      return envHasPrefix(env, "CLAUDE_CODE_");
    }
  },
  {
    id: "qwen",
    test(env) {
      return envHasPrefix(env, "QWEN_");
    }
  },
  {
    id: "kiro",
    test(env) {
      return envHasPrefix(env, "KIRO_");
    }
  },
  {
    id: "qoder",
    test(env) {
      return envHasPrefix(env, "QODER_");
    }
  },
  {
    id: "trae-cn",
    test(env) {
      return envHasPrefix(env, "TRAE_CN_")
        || containsValue(env.TRAE_REGION, ["cn"])
        || containsValue(env.TRAE_CHANNEL, ["cn"]);
    }
  },
  {
    id: "trae",
    test(env) {
      return envHasPrefix(env, "TRAE_");
    }
  },
  {
    id: "opencode",
    test(env) {
      return envHasPrefix(env, "OPENCODE_");
    }
  },
  {
    id: "windsurf",
    test(env) {
      return envHasPrefix(env, "WINDSURF_")
        || containsValue(env.CODEIUM_CONTEXT, ["windsurf"]);
    }
  },
  {
    id: "cursor",
    test(env) {
      return envHasPrefix(env, "CURSOR_");
    }
  },
  {
    id: "antigravity",
    test(env) {
      return envHasPrefix(env, "ANTIGRAVITY_");
    }
  },
  {
    id: "copilot",
    test(env) {
      return envHasPrefix(env, "COPILOT_")
        || envHasPrefix(env, "GITHUB_COPILOT_");
    }
  },
  {
    id: "kimi",
    test(env) {
      return envHasPrefix(env, "KIMI_");
    }
  },
  {
    id: "cline",
    test(env) {
      return envHasPrefix(env, "CLINE_");
    }
  },
  {
    id: "amp",
    test(env) {
      return envHasPrefix(env, "AMP_");
    }
  }
]);

function envHasPrefix(env, prefix) {
  return Object.keys(env).some((key) => key.startsWith(prefix));
}

function containsValue(value, snippets) {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }
  const lowered = value.toLowerCase();
  return snippets.some((snippet) => lowered.includes(snippet.toLowerCase()));
}

function normalizeLineEndings(text) {
  return String(text ?? "").replace(/\r\n?/g, "\n");
}

function stripInlineComment(line) {
  let quote = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"" || char === "'") {
      if (quote === char) {
        quote = null;
      } else if (quote == null) {
        quote = char;
      }
      continue;
    }
    if (char === "#" && quote == null) {
      return line.slice(0, index).trimEnd();
    }
  }
  return line.trimEnd();
}

function stripMatchingQuotes(value) {
  const trimmed = String(value ?? "").trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\""))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function expandHomePath(rawPath) {
  if (typeof rawPath !== "string" || rawPath.length === 0) {
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

function clonePlatformConfigs() {
  return Object.fromEntries(
    Object.entries(DEFAULT_PLATFORM_CONFIGS).map(([id, config]) => [id, { ...config }])
  );
}

export function normalizePlatformId(raw) {
  const trimmed = String(raw ?? "").trim().toLowerCase();
  if (!trimmed) {
    return "";
  }
  return PLATFORM_ALIASES[trimmed] ?? trimmed;
}

export function parsePlatformsToml(content) {
  const normalized = normalizeLineEndings(content);
  const platforms = {};
  let currentPlatformId = null;

  for (const rawLine of normalized.split("\n")) {
    const line = stripInlineComment(rawLine).trim();
    if (!line) {
      continue;
    }

    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      currentPlatformId = null;
      const section = sectionMatch[1].trim();
      if (section.startsWith("platforms.")) {
        currentPlatformId = normalizePlatformId(section.slice("platforms.".length));
        if (currentPlatformId) {
          platforms[currentPlatformId] = platforms[currentPlatformId] ?? {};
        }
      }
      continue;
    }

    if (!currentPlatformId) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripMatchingQuotes(line.slice(separatorIndex + 1).trim());
    if (!["base_dir", "skills_base_dir", "skills_subdir"].includes(key)) {
      continue;
    }

    platforms[currentPlatformId][key] = value;
  }

  return platforms;
}

export function loadPlatformConfigs(options = {}) {
  const {
    userConfigPath = path.join(os.homedir(), ".config", "myclaude", "platforms.toml")
  } = options;

  const configs = clonePlatformConfigs();
  const configContents = [];
  for (const configPath of [REPO_PLATFORMS_TOML, userConfigPath]) {
    try {
      configContents.push(fs.readFileSync(configPath, "utf8"));
    } catch {
      // optional override source
    }
  }

  for (const content of configContents) {
    const overrides = parsePlatformsToml(content);
    for (const [platformId, values] of Object.entries(overrides)) {
      configs[platformId] = {
        ...(configs[platformId] ?? { skills_subdir: "skills" }),
        ...values
      };
    }
  }

  return configs;
}

export function resolveSkillsRoot(config) {
  const baseDir = config.skills_base_dir || config.base_dir;
  return path.resolve(expandHomePath(baseDir), config.skills_subdir || "skills");
}

export function sharedFallbackRoots(configs = loadPlatformConfigs()) {
  return [...new Set(
    UNIVERSAL_SHARED_SKILLS_PLATFORM_IDS
      .map((platformId) => configs[platformId])
      .filter(Boolean)
      .map((config) => resolveSkillsRoot(config))
  )].sort();
}

export function detectCurrentPlatformId(options = {}) {
  const { env = process.env } = options;
  const override = normalizePlatformId(
    env.SKILL_MAP_PLATFORM
    ?? env.MYCLAUDE_PLATFORM
    ?? env.MCS_PLATFORM_ID
    ?? env.MCS_PLATFORM
    ?? ""
  );

  if (override) {
    return override;
  }

  for (const detector of PLATFORM_ENV_SIGNALS) {
    if (detector.test(env)) {
      return detector.id;
    }
  }

  return null;
}

export function defaultSkillRoots(options = {}) {
  const {
    env = process.env,
    userConfigPath
  } = options;

  const configs = loadPlatformConfigs({ userConfigPath });
  const platformId = detectCurrentPlatformId({ env });
  if (platformId && configs[platformId]) {
    return [resolveSkillsRoot(configs[platformId])];
  }
  return sharedFallbackRoots(configs);
}

export function rootLabelForPath(root, configs = loadPlatformConfigs()) {
  const normalizedTarget = path.resolve(root).replace(/\\/g, "/").toLowerCase();
  for (const [platformId, config] of Object.entries(configs)) {
    const resolved = resolveSkillsRoot(config).replace(/\\/g, "/").toLowerCase();
    if (resolved !== normalizedTarget) {
      continue;
    }
    return UNIVERSAL_SHARED_SKILLS_PLATFORM_IDS.includes(platformId) ? "agents" : platformId;
  }

  const segments = normalizedTarget.split("/").filter(Boolean);
  const skillsIndex = segments.lastIndexOf("skills");
  if (skillsIndex > 0) {
    const previous = segments[skillsIndex - 1].replace(/^\./, "");
    if (previous === "antigravity" || previous === "windsurf") {
      return previous;
    }
    if (previous) {
      return previous;
    }
  }

  return path.basename(root).replace(/^\./, "") || "root";
}

export const __testables = Object.freeze({
  DEFAULT_PLATFORM_CONFIGS,
  PLATFORM_ENV_SIGNALS,
  UNIVERSAL_SHARED_SKILLS_PLATFORM_IDS,
  envHasPrefix,
  stripInlineComment,
  clonePlatformConfigs
});
