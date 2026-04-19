// Pure similarity utilities used by skill-map's --analyze mode.
//
// Design notes:
// - Tokenizer mirrors the CJK-aware pattern from
//   content/skills/visual-media-design/brand-design-md/scripts/getdesign-helper.mjs:408-414
//   (lowercase + split on [^a-z0-9\u4e00-\u9fff]+) so 中英混合描述不会被吞掉。
// - Scoring uses Jaccard (|A ∩ B| / |A ∪ B|) instead of brand-design-md's
//   hits/max(len), because Jaccard is symmetric and the thresholds below have
//   a stable interpretation regardless of corpus size imbalance.
// - Everything here is a pure function — no fs, no process. This makes the
//   module trivially testable in isolation.

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "for", "to", "in", "on",
  "with", "by", "as", "at", "is", "are", "be", "this", "that",
  "use", "using", "used", "when", "if", "it", "its", "from",
  "into", "you", "your", "we", "our", "can", "should", "must",
  "only", "will", "would", "may", "do", "does", "done",
  "not", "no", "yes", "also", "etc",
  "skill", "skills", "tool", "tools", "helper", "helpers",
  "的", "了", "与", "和", "是", "在", "或", "对", "以", "用", "为",
  "将", "把", "及", "等", "而", "但", "并", "且", "或者",
  "个", "种", "类", "它", "我"
]);

const CJK_CHARACTER = /[\u3400-\u4dbf\u4e00-\u9fff]/u;
const TOKEN_SPLIT = /[^a-z0-9\u3400-\u4dbf\u4e00-\u9fff]+/u;

export const SCORE_THRESHOLDS = Object.freeze({
  likelyDuplicate: 0.75,
  considerMerge: 0.5,
  review: 0.3
});

const ACTION_RANK = {
  "likely-duplicate": 0,
  "consider-merge": 1,
  "review": 2
};

export function tokenizeForSimilarity(text) {
  if (typeof text !== "string" || text.length === 0) {
    return [];
  }

  const raw = text.toLowerCase();
  const pieces = raw.split(TOKEN_SPLIT).map((piece) => piece.trim()).filter(Boolean);

  const filtered = [];
  for (const piece of pieces) {
    // Pure-CJK runs (e.g. "图像生成") have no word boundaries inside them, so
    // char-level tokens are the most reliable signal for similarity scoring.
    const isPureCjk = /^[\u3400-\u4dbf\u4e00-\u9fff]+$/u.test(piece);
    if (isPureCjk) {
      for (const character of piece) {
        if (STOPWORDS.has(character)) {
          continue;
        }
        filtered.push(character);
      }
      continue;
    }

    if (STOPWORDS.has(piece)) {
      continue;
    }
    if (!CJK_CHARACTER.test(piece) && piece.length < 2) {
      continue;
    }
    filtered.push(piece);
  }

  return filtered;
}

export function jaccard(left, right) {
  const leftSet = left instanceof Set ? left : new Set(left);
  const rightSet = right instanceof Set ? right : new Set(right);

  if (leftSet.size === 0 || rightSet.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of leftSet) {
    if (rightSet.has(token)) {
      intersection += 1;
    }
  }

  const union = leftSet.size + rightSet.size - intersection;
  if (union === 0) {
    return 0;
  }
  return intersection / union;
}

export function classifyPair(score) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return null;
  }
  if (score >= SCORE_THRESHOLDS.likelyDuplicate) {
    return "likely-duplicate";
  }
  if (score >= SCORE_THRESHOLDS.considerMerge) {
    return "consider-merge";
  }
  if (score >= SCORE_THRESHOLDS.review) {
    return "review";
  }
  return null;
}

function intersectionTokens(leftSet, rightSet, limit = 8) {
  const shared = [];
  for (const token of leftSet) {
    if (rightSet.has(token)) {
      shared.push(token);
    }
  }
  shared.sort();
  return shared.slice(0, limit);
}

function buildRowDigests(rows) {
  return rows.map((row) => {
    const parts = [
      row?.name ?? "",
      row?.desc ?? "",
      Array.isArray(row?.tags) ? row.tags.join(" ") : ""
    ];
    const tokens = new Set(tokenizeForSimilarity(parts.join(" ")));
    return { row, tokens };
  });
}

function rowIdentity(row) {
  return String(row?.instance_id ?? row?.name ?? "").trim();
}

function computePairs(digests, threshold) {
  const pairs = [];
  for (let i = 0; i < digests.length; i += 1) {
    for (let j = i + 1; j < digests.length; j += 1) {
      const score = jaccard(digests[i].tokens, digests[j].tokens);
      if (score < threshold) {
        continue;
      }
      const left = digests[i].row;
      const right = digests[j].row;
      pairs.push({
        left_id: rowIdentity(left),
        left_name: left?.name ?? "",
        left_display_name: left?.display_name ?? left?.name ?? "",
        right_id: rowIdentity(right),
        right_name: right?.name ?? "",
        right_display_name: right?.display_name ?? right?.name ?? "",
        score: Number(score.toFixed(4)),
        shared_tokens: intersectionTokens(digests[i].tokens, digests[j].tokens)
      });
    }
  }

  pairs.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    if (left.left_display_name !== right.left_display_name) {
      return left.left_display_name.localeCompare(right.left_display_name);
    }
    return left.right_display_name.localeCompare(right.right_display_name);
  });

  return pairs;
}

function unionFindClusters(pairs, allIds) {
  const parent = new Map();
  const find = (x) => {
    let current = x;
    while (parent.get(current) !== current) {
      parent.set(current, parent.get(parent.get(current)));
      current = parent.get(current);
    }
    return current;
  };
  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) {
      parent.set(ra, rb);
    }
  };

  for (const id of allIds) {
    parent.set(id, id);
  }
  for (const pair of pairs) {
    if (!parent.has(pair.left_id)) parent.set(pair.left_id, pair.left_id);
    if (!parent.has(pair.right_id)) parent.set(pair.right_id, pair.right_id);
    union(pair.left_id, pair.right_id);
  }

  const buckets = new Map();
  for (const id of parent.keys()) {
    const root = find(id);
    if (!buckets.has(root)) {
      buckets.set(root, new Set());
    }
    buckets.get(root).add(id);
  }

  return buckets;
}

export function buildClusters(pairs, rowIndex) {
  const allIds = [...rowIndex.keys()];
  const buckets = unionFindClusters(pairs, allIds);

  const clusters = [];
  let clusterSeq = 0;

  const rootsSorted = [...buckets.keys()].sort();
  for (const root of rootsSorted) {
    const memberSet = buckets.get(root);
    if (memberSet.size < 2) {
      continue;
    }

    const members = [...memberSet]
      .map((id) => rowIndex.get(id))
      .filter(Boolean)
      .sort((left, right) => {
        const leftLabel = left.display_name ?? left.name ?? "";
        const rightLabel = right.display_name ?? right.name ?? "";
        if (leftLabel !== rightLabel) {
          return leftLabel.localeCompare(rightLabel);
        }
        return rowIdentity(left).localeCompare(rowIdentity(right));
      })
      .map((row) => ({
        instance_id: rowIdentity(row),
        name: row.name,
        display_name: row.display_name ?? row.name,
        install_root: row.install_root ?? "",
        group_key: row.group_key ?? ""
      }));
    const memberPairs = pairs.filter(
      (pair) => memberSet.has(pair.left_id) && memberSet.has(pair.right_id)
    );
    if (memberPairs.length === 0) {
      continue;
    }

    const maxScore = memberPairs.reduce(
      (acc, pair) => (pair.score > acc ? pair.score : acc),
      0
    );
    const action = classifyPair(maxScore);
    if (!action) {
      continue;
    }

    const frequency = new Map();
    for (const pair of memberPairs) {
      for (const token of pair.shared_tokens) {
        frequency.set(token, (frequency.get(token) ?? 0) + 1);
      }
    }
    const sharedTokens = [...frequency.entries()]
      .sort((left, right) => {
        if (right[1] !== left[1]) {
          return right[1] - left[1];
        }
        return left[0].localeCompare(right[0]);
      })
      .slice(0, 8)
      .map(([token]) => token);

    const groupKeys = [...new Set(
      members
        .map((member) => member.group_key)
        .filter((key) => typeof key === "string" && key.length > 0)
    )].sort();

    clusterSeq += 1;
    clusters.push({
      id: `c${clusterSeq}`,
      action,
      max_score: Number(maxScore.toFixed(4)),
      members,
      shared_tokens: sharedTokens,
      group_keys: groupKeys,
      rationale:
        groupKeys.length === 1
          ? "同组别 + token 高重合"
          : groupKeys.length > 1
          ? "跨组别但 token 重合"
          : "token 重合"
    });
  }

  clusters.sort((left, right) => {
    const rankDiff = ACTION_RANK[left.action] - ACTION_RANK[right.action];
    if (rankDiff !== 0) {
      return rankDiff;
    }
    if (right.max_score !== left.max_score) {
      return right.max_score - left.max_score;
    }
    return left.members[0].display_name.localeCompare(right.members[0].display_name);
  });

  return clusters;
}

export function analyzeSkills(rows, options = {}) {
  const threshold =
    typeof options.threshold === "number" && Number.isFinite(options.threshold)
      ? Math.max(0, Math.min(1, options.threshold))
      : SCORE_THRESHOLDS.review;

  const safeRows = Array.isArray(rows) ? rows : [];
  const digests = buildRowDigests(safeRows);
  const pairs = computePairs(digests, threshold);
  const rowIndex = new Map(safeRows.map((row) => [rowIdentity(row), row]));
  const clusters = buildClusters(pairs, rowIndex);

  const skillsInClusters = new Set();
  for (const cluster of clusters) {
    for (const member of cluster.members) {
      skillsInClusters.add(member.instance_id);
    }
  }

  const summary = {
    total_skills: safeRows.length,
    clusters: clusters.length,
    skills_in_clusters: skillsInClusters.size,
    likely_duplicates: clusters.filter((cluster) => cluster.action === "likely-duplicate").length,
    consider_merge: clusters.filter((cluster) => cluster.action === "consider-merge").length,
    review: clusters.filter((cluster) => cluster.action === "review").length
  };

  const generatedAt =
    options.now instanceof Date
      ? options.now.toISOString()
      : typeof options.now === "string" && options.now.length > 0
      ? options.now
      : new Date().toISOString();

  return {
    generated_at: generatedAt,
    threshold,
    summary,
    clusters,
    pairs
  };
}

export const __testables = Object.freeze({
  STOPWORDS,
  intersectionTokens,
  buildRowDigests,
  computePairs,
  rowIdentity,
  unionFindClusters
});
