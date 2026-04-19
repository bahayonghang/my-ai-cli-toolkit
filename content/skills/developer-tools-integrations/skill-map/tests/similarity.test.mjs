import test from "node:test";
import assert from "node:assert/strict";

import {
  analyzeSkills,
  buildClusters,
  classifyPair,
  jaccard,
  SCORE_THRESHOLDS,
  tokenizeForSimilarity
} from "../scripts/lib/similarity.mjs";

test("tokenizeForSimilarity drops stopwords and short non-CJK tokens", () => {
  const tokens = tokenizeForSimilarity("The code review helper is a tool for you");
  assert.deepEqual(tokens.sort(), ["code", "review"]);
});

test("tokenizeForSimilarity keeps single-character CJK tokens", () => {
  const tokens = tokenizeForSimilarity("图像生成与翻译");
  assert.ok(tokens.includes("图"));
  assert.ok(tokens.includes("译"));
  assert.equal(tokens.includes("与"), false, "与 should be treated as a stopword");
});

test("tokenizeForSimilarity handles nullish and non-string input", () => {
  assert.deepEqual(tokenizeForSimilarity(null), []);
  assert.deepEqual(tokenizeForSimilarity(undefined), []);
  assert.deepEqual(tokenizeForSimilarity(123), []);
});

test("tokenizeForSimilarity splits on ASCII + CJK punctuation boundaries", () => {
  const tokens = tokenizeForSimilarity("Run tests,格式化 code — for developers");
  assert.ok(tokens.includes("run"));
  assert.ok(tokens.includes("tests"));
  assert.ok(tokens.includes("code"));
  assert.ok(tokens.includes("developers"));
});

test("jaccard returns 1 for identical token sets", () => {
  const score = jaccard(["code", "review"], ["code", "review"]);
  assert.equal(score, 1);
});

test("jaccard returns 0 for disjoint token sets", () => {
  const score = jaccard(["code"], ["ocean"]);
  assert.equal(score, 0);
});

test("jaccard returns 0 when either side is empty", () => {
  assert.equal(jaccard([], ["a"]), 0);
  assert.equal(jaccard(["a"], []), 0);
  assert.equal(jaccard([], []), 0);
});

test("jaccard is symmetric and uses union size in denominator", () => {
  const a = new Set(["code", "review", "quality"]);
  const b = new Set(["code", "review", "safety"]);
  const forward = jaccard(a, b);
  const backward = jaccard(b, a);
  assert.equal(forward, backward);
  // |A∩B|=2 (code,review); |A∪B|=4 (code,review,quality,safety); 2/4 = 0.5
  assert.equal(forward, 0.5);
});

test("classifyPair boundaries map scores to the correct action", () => {
  assert.equal(classifyPair(1.0), "likely-duplicate");
  assert.equal(classifyPair(SCORE_THRESHOLDS.likelyDuplicate), "likely-duplicate");
  assert.equal(classifyPair(SCORE_THRESHOLDS.likelyDuplicate - 0.0001), "consider-merge");

  assert.equal(classifyPair(SCORE_THRESHOLDS.considerMerge), "consider-merge");
  assert.equal(classifyPair(SCORE_THRESHOLDS.considerMerge - 0.0001), "review");

  assert.equal(classifyPair(SCORE_THRESHOLDS.review), "review");
  assert.equal(classifyPair(SCORE_THRESHOLDS.review - 0.0001), null);

  assert.equal(classifyPair(0), null);
  assert.equal(classifyPair(Number.NaN), null);
  assert.equal(classifyPair("0.9"), null);
});

test("analyzeSkills produces no clusters when rows are empty", () => {
  const analysis = analyzeSkills([], { now: "2026-04-18T00:00:00.000Z" });
  assert.equal(analysis.clusters.length, 0);
  assert.equal(analysis.pairs.length, 0);
  assert.equal(analysis.summary.total_skills, 0);
  assert.equal(analysis.summary.clusters, 0);
  assert.equal(analysis.generated_at, "2026-04-18T00:00:00.000Z");
});

test("analyzeSkills builds a two-member cluster for obvious duplicates", () => {
  const rows = [
    {
      name: "code-reviewer",
      desc: "Review code for quality security and maintainability",
      group_key: "system-maintenance"
    },
    {
      name: "code-reviewer-low",
      desc: "Review code for quality security and maintainability (haiku)",
      group_key: "system-maintenance"
    },
    {
      name: "paper-helper",
      desc: "Research helper for reading academic papers",
      group_key: "cognitive-analysis"
    }
  ];

  const analysis = analyzeSkills(rows, { now: "2026-04-18T00:00:00.000Z" });

  assert.equal(analysis.clusters.length, 1);
  const [cluster] = analysis.clusters;
  assert.deepEqual(
    cluster.members.map((member) => member.name),
    ["code-reviewer", "code-reviewer-low"]
  );
  assert.equal(cluster.action, "likely-duplicate");
  assert.ok(cluster.shared_tokens.includes("code"));
  assert.ok(cluster.shared_tokens.includes("review"));
  assert.deepEqual(cluster.group_keys, ["system-maintenance"]);
  assert.ok(cluster.max_score >= SCORE_THRESHOLDS.likelyDuplicate);
});

test("analyzeSkills merges transitive similarity into a single cluster", () => {
  const rows = [
    { name: "writer-a", desc: "Write documentation and articles", group_key: "document-expression" },
    { name: "writer-b", desc: "Write documentation and blog posts", group_key: "document-expression" },
    { name: "writer-c", desc: "Write articles and blog posts", group_key: "document-expression" },
    { name: "unrelated", desc: "Run database migrations", group_key: "development-implementation" }
  ];

  const analysis = analyzeSkills(rows, { now: "2026-04-18T00:00:00.000Z" });

  const clusterWithWriters = analysis.clusters.find((cluster) =>
    cluster.members.some((member) => member.name === "writer-a")
    && cluster.members.some((member) => member.name === "writer-c")
  );
  assert.ok(clusterWithWriters, "writers should merge via transitive similarity");
  assert.deepEqual(
    clusterWithWriters.members.map((member) => member.name).sort(),
    ["writer-a", "writer-b", "writer-c"]
  );
  assert.equal(
    clusterWithWriters.members.some((member) => member.name === "unrelated"),
    false
  );
});

test("analyzeSkills threshold filters low-similarity pairs", () => {
  const rows = [
    { name: "alpha", desc: "database migration runner", group_key: "development-implementation" },
    { name: "beta", desc: "database migration checker", group_key: "development-implementation" }
  ];

  const highThreshold = analyzeSkills(rows, { threshold: 0.95, now: "2026-04-18T00:00:00.000Z" });
  assert.equal(highThreshold.clusters.length, 0, "0.95 threshold should reject moderate matches");

  const lowThreshold = analyzeSkills(rows, { threshold: 0.3, now: "2026-04-18T00:00:00.000Z" });
  assert.equal(lowThreshold.clusters.length, 1, "0.3 threshold should accept moderate matches");
});

test("analyzeSkills orders clusters likely-duplicate → consider-merge → review", () => {
  const rows = [
    { name: "dup-a", desc: "render compact ascii map of installed code tools", group_key: "system-maintenance" },
    { name: "dup-b", desc: "render compact ascii map of installed code tools", group_key: "system-maintenance" },
    { name: "merge-a", desc: "fetch web browser content via playwright", group_key: "workflow-integration" },
    { name: "merge-b", desc: "fetch web content via playwright extension", group_key: "workflow-integration" }
  ];

  const analysis = analyzeSkills(rows, { now: "2026-04-18T00:00:00.000Z" });

  assert.ok(analysis.clusters.length >= 1, "expected at least one cluster");
  const actions = analysis.clusters.map((cluster) => cluster.action);
  if (actions.includes("consider-merge") && actions.includes("likely-duplicate")) {
    const dupIndex = actions.indexOf("likely-duplicate");
    const mergeIndex = actions.indexOf("consider-merge");
    assert.ok(dupIndex < mergeIndex, "likely-duplicate must come before consider-merge");
  }
});

test("analyzeSkills summary counts reflect cluster distribution", () => {
  const rows = [
    { name: "dup-a", desc: "render compact ascii map of installed code tools", group_key: "system-maintenance" },
    { name: "dup-b", desc: "render compact ascii map of installed code tools", group_key: "system-maintenance" },
    { name: "solo", desc: "something entirely different like cooking recipes", group_key: "uncategorized" }
  ];

  const analysis = analyzeSkills(rows, { now: "2026-04-18T00:00:00.000Z" });

  assert.equal(analysis.summary.total_skills, 3);
  assert.equal(analysis.summary.clusters, 1);
  assert.equal(analysis.summary.skills_in_clusters, 2);
  assert.equal(
    analysis.summary.likely_duplicates +
      analysis.summary.consider_merge +
      analysis.summary.review,
    1
  );
});

test("buildClusters keeps single-skill components out of the result", () => {
  const rowIndex = new Map([
    ["alpha", { instance_id: "alpha", name: "alpha", group_key: "a" }],
    ["beta", { instance_id: "beta", name: "beta", group_key: "a" }],
    ["gamma", { instance_id: "gamma", name: "gamma", group_key: "b" }]
  ]);
  const pairs = [
    { left_id: "alpha", right_id: "beta", score: 0.9, shared_tokens: ["foo"] }
  ];

  const clusters = buildClusters(pairs, rowIndex);
  assert.equal(clusters.length, 1);
  assert.deepEqual(
    clusters[0].members.map((member) => member.name),
    ["alpha", "beta"]
  );
  assert.equal(
    clusters[0].members.some((member) => member.name === "gamma"),
    false
  );
});

test("buildClusters aggregates shared_tokens from all member pairs", () => {
  const rowIndex = new Map([
    ["a", { instance_id: "a", name: "a", group_key: "x" }],
    ["b", { instance_id: "b", name: "b", group_key: "x" }],
    ["c", { instance_id: "c", name: "c", group_key: "x" }]
  ]);
  const pairs = [
    { left_id: "a", right_id: "b", score: 0.8, shared_tokens: ["code", "review"] },
    { left_id: "b", right_id: "c", score: 0.7, shared_tokens: ["code", "quality"] }
  ];

  const clusters = buildClusters(pairs, rowIndex);
  assert.equal(clusters.length, 1);
  const tokens = clusters[0].shared_tokens;
  assert.equal(tokens[0], "code", "most frequent token should come first");
  assert.ok(tokens.includes("review"));
  assert.ok(tokens.includes("quality"));
});

test("analyzeSkills is deterministic when options.now is supplied", () => {
  const rows = [
    { name: "x", desc: "code review", group_key: "system-maintenance" },
    { name: "y", desc: "code review", group_key: "system-maintenance" }
  ];
  const first = analyzeSkills(rows, { now: "2026-04-18T00:00:00.000Z" });
  const second = analyzeSkills(rows, { now: "2026-04-18T00:00:00.000Z" });
  assert.deepEqual(first, second);
});

test("analyzeSkills keeps duplicate display names distinct when instance ids differ", () => {
  const rows = [
    {
      instance_id: "claude::browse",
      name: "browse",
      display_name: "browse@claude",
      desc: "Browser automation and QA flows",
      group_key: "workflow-integration",
      install_root: "/tmp/.claude/skills"
    },
    {
      instance_id: "agents::browse",
      name: "browse",
      display_name: "browse@agents",
      desc: "Browser automation and QA flows",
      group_key: "workflow-integration",
      install_root: "/tmp/.agents/skills"
    }
  ];

  const analysis = analyzeSkills(rows, { now: "2026-04-18T00:00:00.000Z" });
  assert.equal(analysis.clusters.length, 1);
  assert.deepEqual(
    analysis.clusters[0].members.map((member) => member.display_name),
    ["browse@agents", "browse@claude"]
  );
  assert.equal(analysis.pairs[0].left_id, "claude::browse");
  assert.equal(analysis.pairs[0].right_id, "agents::browse");
});
