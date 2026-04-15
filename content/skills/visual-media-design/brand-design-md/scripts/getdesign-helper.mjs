#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const NPX_COMMAND = process.platform === "win32" ? "npx.cmd" : "npx";

const ALIASES = {
  "airbnb": ["爱彼迎"],
  "apple": ["苹果", "apple 官网"],
  "binance": ["币安"],
  "bmw": ["宝马"],
  "bugatti": ["布加迪"],
  "cal": ["cal.com"],
  "claude": ["anthropic", "claude ai"],
  "cursor": ["ai 编辑器", "ai编辑器"],
  "elevenlabs": ["11labs", "语音 ai", "语音ai"],
  "ferrari": ["法拉利"],
  "figma": ["设计工具"],
  "framer": ["建站工具"],
  "ibm": ["ibm carbon", "carbon"],
  "kraken": ["海妖"],
  "lamborghini": ["兰博基尼"],
  "linear.app": ["linear", "linear app", "项目管理"],
  "meta": ["facebook"],
  "mintlify": ["文档平台"],
  "mistral.ai": ["mistral", "mistral ai"],
  "miro": ["在线白板"],
  "nike": ["耐克"],
  "notion": ["notion.so", "笔记工具"],
  "nvidia": ["英伟达"],
  "opencode.ai": ["opencode", "open code"],
  "playstation": ["ps", "ps5", "play station", "索尼游戏机"],
  "runwayml": ["runway", "runway ml", "runway ai", "ai 视频", "ai视频"],
  "stripe": ["支付", "stripe.com"],
  "supabase": ["supabase io"],
  "superhuman": ["邮件客户端"],
  "tesla": ["特斯拉"],
  "theverge": ["the verge"],
  "together.ai": ["together", "together ai"],
  "vercel": ["vercel.com"],
  "warp": ["终端"],
  "wired": ["wired 杂志", "连线杂志"],
  "wise": ["transferwise"],
  "x.ai": ["xai", "grok", "x ai"],
  "zapier": ["自动化平台"]
};

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "app",
  "build",
  "card",
  "component",
  "create",
  "design",
  "feel",
  "for",
  "hero",
  "in",
  "landing",
  "like",
  "logo",
  "make",
  "page",
  "react",
  "section",
  "style",
  "theme",
  "ui",
  "with",
  "一个",
  "做",
  "做成",
  "参考",
  "感觉",
  "改成",
  "排版",
  "页面",
  "组件",
  "设计",
  "风格"
]);

let officialBrandsCache = null;

main();

function main() {
  const [command, ...argv] = process.argv.slice(2);

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    process.exit(0);
  }

  try {
    if (command === "list") {
      handleList(argv);
      return;
    }

    if (command === "resolve") {
      handleResolve(argv);
      return;
    }

    if (command === "fetch") {
      handleFetch(argv);
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    fail(error);
  }
}

function printHelp() {
  console.log(`brand-design-md helper

Usage:
  node getdesign-helper.mjs list [--json]
  node getdesign-helper.mjs resolve --query "<user request>" [--max 3]
  node getdesign-helper.mjs fetch --slug <brand-slug> [--out <file>]
`);
}

function handleList(argv) {
  const options = parseArgs(argv);
  const brands = getOfficialBrands();
  if (options.json) {
    printJson({
      brandCount: brands.length,
      brands
    });
    return;
  }

  for (const brand of brands) {
    console.log(`${brand.slug} - ${brand.description}`);
  }
}

function handleResolve(argv) {
  const options = parseArgs(argv);
  const query = getRequiredString(options, "query");
  const max = Math.max(1, Number(options.max ?? 3));
  const brands = getOfficialBrands();
  const exactMatches = findExactMatches(query, brands, max);
  const ranked = rankBrands(query, brands).slice(0, Math.max(max, 3));
  const strongFuzzyMatches = exactMatches.length > 0
    ? []
    : ranked.filter((item) => item.score >= 0.78).slice(0, max);

  const matches = exactMatches.length > 0
    ? exactMatches.map(formatResolvedMatch)
    : strongFuzzyMatches.map(formatResolvedMatch);

  const suggestions = ranked
    .filter((item) => !matches.some((match) => match.slug === item.brand.slug))
    .slice(0, 3)
    .map(formatResolvedMatch);

  const resolution = exactMatches.length > 0
    ? "exact"
    : strongFuzzyMatches.length > 0
      ? "fuzzy"
      : "none";

  printJson({
    query,
    resolution,
    brandCount: brands.length,
    matches,
    suggestions
  });
}

function handleFetch(argv) {
  const options = parseArgs(argv);
  const slug = getRequiredString(options, "slug");
  const brands = getOfficialBrands();
  const brand = brands.find((item) => item.slug === slug);

  if (!brand) {
    const suggestions = rankBrands(slug, brands).slice(0, 3).map(formatResolvedMatch);
    printJson({
      ok: false,
      error: `Unknown brand slug: ${slug}`,
      suggestions
    });
    process.exit(1);
  }

  const outPath = options.out
    ? path.resolve(String(options.out))
    : path.join(
        os.tmpdir(),
        "brand-design-md",
        `${slug.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "")}-${Date.now()}.md`
      );

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  runGetdesign(["add", slug, "--out", outPath]);

  if (!fs.existsSync(outPath)) {
    throw new Error(`getdesign did not create the expected output file: ${outPath}`);
  }

  printJson({
    ok: true,
    slug,
    description: brand.description,
    outPath,
    isTemp: !options.out
  });
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--json") {
      options.json = true;
      continue;
    }

    if (!token.startsWith("--")) {
      if (!options._) {
        options._ = [];
      }
      options._.push(token);
      continue;
    }

    const key = token.slice(2);
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = value;
    index += 1;
  }
  return options;
}

function getRequiredString(options, key) {
  const direct = options[key];
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  if (Array.isArray(options._) && options._.length > 0) {
    return options._.join(" ").trim();
  }

  throw new Error(`Missing required option: --${key}`);
}

function getOfficialBrands() {
  if (officialBrandsCache) {
    return officialBrandsCache;
  }

  const stdout = runGetdesign(["list"]);
  officialBrandsCache = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(" - ");
      const slug = separator === -1 ? line : line.slice(0, separator).trim();
      const description = separator === -1 ? "" : line.slice(separator + 3).trim();
      return {
        slug,
        description,
        aliases: ALIASES[slug] ?? [],
        terms: buildSearchTerms(slug)
      };
    });
  return officialBrandsCache;
}

function buildSearchTerms(slug) {
  const values = new Set([slug]);
  values.add(slug.replace(/\.(ai|app)$/i, ""));
  values.add(slug.replace(/[.\-]/g, " "));
  values.add(slug.replace(/[.\-]/g, ""));

  for (const alias of ALIASES[slug] ?? []) {
    values.add(alias);
  }

  return Array.from(values)
    .map((value) => value.trim())
    .filter(Boolean);
}

function findExactMatches(query, brands, max) {
  const queryLower = query.toLowerCase();
  const queryNormalized = normalize(query);
  const matches = [];

  for (const brand of brands) {
    let bestMatch = null;

    for (const term of brand.terms) {
      const position = findTermPosition(queryLower, queryNormalized, term);
      if (position === -1) {
        continue;
      }

      const isAlias = brand.aliases.includes(term);
      const candidate = {
        brand,
        term,
        position,
        score: isAlias ? 0.99 : term === brand.slug ? 0.96 : 0.93,
        source: isAlias ? "alias" : term === brand.slug ? "slug" : "variant"
      };

      if (!bestMatch || candidate.position < bestMatch.position || candidate.score > bestMatch.score) {
        bestMatch = candidate;
      }
    }

    if (bestMatch) {
      matches.push(bestMatch);
    }
  }

  return matches
    .sort((left, right) => left.position - right.position || right.score - left.score)
    .slice(0, max);
}

function findTermPosition(queryLower, queryNormalized, term) {
  const termLower = term.toLowerCase();
  if (containsCjk(termLower)) {
    return queryLower.indexOf(termLower);
  }

  const rawMatcher = new RegExp(`(^|[^a-z0-9])${escapeRegExp(termLower)}([^a-z0-9]|$)`, "i");
  const rawMatch = rawMatcher.exec(queryLower);
  if (rawMatch) {
    return rawMatch.index + rawMatch[1].length;
  }

  const normalizedTerm = normalize(term);
  if (!normalizedTerm) {
    return -1;
  }
  return queryNormalized.indexOf(normalizedTerm);
}

function rankBrands(query, brands) {
  const queryNormalized = normalize(query);
  const queryTokens = tokenize(query);

  return brands
    .map((brand) => {
      const termScore = Math.max(
        ...brand.terms.map((term) => similarityScore(queryNormalized, normalize(term)))
      );
      const descriptionScore = scoreTokenOverlap(queryTokens, tokenize(brand.description));
      return {
        brand,
        term: brand.slug,
        score: Math.max(termScore, descriptionScore * 0.72),
        source: "fuzzy"
      };
    })
    .sort((left, right) => right.score - left.score);
}

function similarityScore(left, right) {
  if (!left || !right) {
    return 0;
  }
  if (left === right) {
    return 1;
  }
  if (left.includes(right) || right.includes(left)) {
    return Math.min(left.length, right.length) / Math.max(left.length, right.length) * 0.92;
  }

  const distance = levenshtein(left, right);
  return 1 - distance / Math.max(left.length, right.length);
}

function scoreTokenOverlap(leftTokens, rightTokens) {
  if (leftTokens.length === 0 || rightTokens.length === 0) {
    return 0;
  }

  const rightSet = new Set(rightTokens);
  const hits = leftTokens.filter((token) => rightSet.has(token)).length;
  return hits / Math.max(leftTokens.length, rightTokens.length);
}

function tokenize(input) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fff]+/u)
    .map((token) => token.trim())
    .filter((token) => token && !STOPWORDS.has(token));
}

function normalize(input) {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gu, "");
}

function containsCjk(input) {
  return /[\u4e00-\u9fff]/u.test(input);
}

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function levenshtein(left, right) {
  const rows = Array.from({ length: left.length + 1 }, () => new Array(right.length + 1).fill(0));

  for (let row = 0; row <= left.length; row += 1) {
    rows[row][0] = row;
  }
  for (let column = 0; column <= right.length; column += 1) {
    rows[0][column] = column;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + cost
      );
    }
  }

  return rows[left.length][right.length];
}

function runGetdesign(args) {
  try {
    if (process.platform === "win32") {
      const command = buildWindowsCommand(["npx", "getdesign@latest", ...args]);
      return execFileSync("cmd.exe", ["/d", "/s", "/c", command], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
      });
    }

    return execFileSync(NPX_COMMAND, ["getdesign@latest", ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (error) {
    const stderr = error.stderr ? String(error.stderr).trim() : "";
    const stdout = error.stdout ? String(error.stdout).trim() : "";
    throw new Error(stderr || stdout || error.message);
  }
}

function buildWindowsCommand(parts) {
  return parts
    .map((part) => {
      if (/[\s"&()^|<>]/.test(part)) {
        return `"${part.replace(/"/g, '\\"')}"`;
      }
      return part;
    })
    .join(" ");
}

function formatResolvedMatch(item) {
  return {
    slug: item.brand.slug,
    description: item.brand.description,
    matchSource: item.source,
    matchText: item.term,
    confidence: Number(item.score.toFixed(3))
  };
}

function printJson(payload) {
  console.log(JSON.stringify(payload, null, 2));
}

function fail(error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ ok: false, error: message }, null, 2));
  process.exit(1);
}
