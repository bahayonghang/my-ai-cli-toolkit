import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { renderSkillMap } from "../scripts/skill-map.mjs";

const SCRIPT_PATH = path.resolve(
  "content/skills/developer-tools-integrations/skill-map/scripts/skill-map.mjs"
);

function makeTempRoot(prefix = "skill-map-test-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeSkill(root, dirName, content) {
  const skillDir = path.join(root, dirName);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), content, "utf8");
}

function runCli(args) {
  const result = spawnSync(process.execPath, [SCRIPT_PATH, ...args], {
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}

function parseJsonOutput(args) {
  return JSON.parse(runCli(["--json", ...args]));
}

test("json output is valid and every record includes group_key", () => {
  const root = makeTempRoot();
  try {
    writeSkill(
      root,
      "paper-helper",
      `---
name: paper-helper
description: "Research helper for reading papers."
version: "1.0.0"
---
# body
`
    );

    const rows = parseJsonOutput(["--root", root]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].group_key, "cognitive-analysis");
    assert.equal(typeof rows[0].install_root, "string");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("single-line description and explicit metadata are parsed correctly", () => {
  const root = makeTempRoot();
  try {
    writeSkill(
      root,
      "toolbox",
      `---
name: toolbox
description: "Command line helper for code and build tasks."
version: "1.2.3"
category: developer-tools-integrations
user_invocable: true
---
# body
`
    );

    const [row] = parseJsonOutput(["--root", root]);
    assert.equal(row.name, "toolbox");
    assert.equal(row.version, "1.2.3");
    assert.equal(row.source_category, "developer-tools-integrations");
    assert.equal(row.invocable, true);
    assert.equal(row.group_key, "development-implementation");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("multiline description parsing does not swallow later keys", () => {
  const root = makeTempRoot();
  try {
    writeSkill(
      root,
      "reader",
      `---
name: reader
description: |-
  Research helper for reading papers.
  Explains concepts and summarizes findings.
version: "0.9.0"
category: docs-writing-publishing
---
# body
`
    );

    const [row] = parseJsonOutput(["--root", root]);
    assert.equal(row.version, "0.9.0");
    assert.equal(row.source_category, "docs-writing-publishing");
    assert.match(row.desc, /Research helper/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("missing version becomes hyphen", () => {
  const root = makeTempRoot();
  try {
    writeSkill(
      root,
      "noversion",
      `---
name: noversion
description: "Minimal helper"
---
# body
`
    );

    const [row] = parseJsonOutput(["--root", root]);
    assert.equal(row.version, "-");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("missing user_invocable remains null and footer reports unknown count", () => {
  const root = makeTempRoot();
  try {
    writeSkill(
      root,
      "mystery",
      `---
name: mystery
description: "Something unusual without an obvious keyword."
---
# body
`
    );

    const [row] = parseJsonOutput(["--root", root]);
    assert.equal(row.invocable, null);

    const output = runCli(["--root", root]);
    assert.match(output, /Unknown: 1/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("empty roots still render a complete box and empty-state message", () => {
  const root = makeTempRoot();
  try {
    const output = runCli(["--root", root]);
    assert.match(output, /^╔/);
    assert.match(output, /No installed skills found under configured skill roots/);
    assert.match(output, /╚/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("single skill output keeps the full ASCII template", () => {
  const rows = [
    {
      name: "paper",
      version: "4.3.0",
      invocable: true,
      desc: "论文阅读与分析",
      source_category: "research-learning-knowledge",
      group_key: "cognitive-analysis",
      install_root: "/tmp/skills"
    }
  ];

  const output = renderSkillMap(rows);
  assert.match(output, /^╔/);
  assert.match(output, /◆ 认知与分析/);
  assert.match(output, /paper\/ v4\.3\.0/);
  assert.match(output, /Total: 1  Invocable: 1  Unknown: 0  Groups: 1/);
  assert.match(output, /╚/);
});

test("duplicate names across roots keep the first root's version and source", () => {
  const firstRoot = makeTempRoot("skill-map-first-");
  const secondRoot = makeTempRoot("skill-map-second-");
  try {
    writeSkill(
      firstRoot,
      "shared-skill",
      `---
name: shared-skill
description: "First root version"
version: "1.0.0"
---
# body
`
    );
    writeSkill(
      secondRoot,
      "shared-skill",
      `---
name: shared-skill
description: "Second root version"
version: "2.0.0"
---
# body
`
    );

    const [row] = parseJsonOutput(["--root", firstRoot, "--root", secondRoot]);
    assert.equal(row.version, "1.0.0");
    assert.match(row.install_root, new RegExp(firstRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  } finally {
    fs.rmSync(firstRoot, { recursive: true, force: true });
    fs.rmSync(secondRoot, { recursive: true, force: true });
  }
});

test("source_category is preserved but does not override inferred group_key", () => {
  const root = makeTempRoot();
  try {
    writeSkill(
      root,
      "reader",
      `---
name: reader
description: "Research helper for reading papers."
category: developer-tools-integrations
---
# body
`
    );

    const [row] = parseJsonOutput(["--root", root]);
    assert.equal(row.source_category, "developer-tools-integrations");
    assert.equal(row.group_key, "cognitive-analysis");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("--root overrides default roots for isolated scans", () => {
  const root = makeTempRoot();
  try {
    writeSkill(
      root,
      "override-only",
      `---
name: override-only
description: "Dedicated test root"
---
# body
`
    );

    const rows = parseJsonOutput(["--root", root]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].name, "override-only");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
