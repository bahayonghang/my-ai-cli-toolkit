import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  defaultSkillRoots,
  loadPlatformConfigs,
  normalizePlatformId,
  parsePlatformsToml,
  rootLabelForPath,
  sharedFallbackRoots
} from "../scripts/lib/platforms.mjs";

function makeTempRoot(prefix = "skill-map-platforms-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test("repository platform config no longer exposes a Gemini command source", () => {
  const configs = loadPlatformConfigs({
    userConfigPath: path.join(makeTempRoot(), "missing-platforms.toml")
  });

  assert.equal(configs.gemini, undefined);
  assert.equal(configs.antigravity.base_dir, "~/.gemini/antigravity");
  assert.equal(configs.antigravity.skills_subdir, "skills");
});

test("universal alias resolves to the shared agents root without a Gemini platform", () => {
  assert.equal(normalizePlatformId("universal"), "codex");

  const configRoot = makeTempRoot();
  try {
    const roots = defaultSkillRoots({
      env: { SKILL_MAP_PLATFORM: "universal" },
      userConfigPath: path.join(configRoot, "platforms.toml")
    });

    assert.deepEqual(roots, [path.join(os.homedir(), ".agents", "skills")]);
  } finally {
    fs.rmSync(configRoot, { recursive: true, force: true });
  }
});

test("Gemini environment variables no longer select a removed Gemini platform", () => {
  const configRoot = makeTempRoot();
  try {
    const roots = defaultSkillRoots({
      env: { GEMINI_API_KEY: "set" },
      userConfigPath: path.join(configRoot, "platforms.toml")
    });

    assert.deepEqual(roots, [path.join(os.homedir(), ".agents", "skills")]);
  } finally {
    fs.rmSync(configRoot, { recursive: true, force: true });
  }
});

test("Antigravity remains a first-class platform with a distinct skills root", () => {
  const configRoot = makeTempRoot();
  try {
    const roots = defaultSkillRoots({
      env: { ANTIGRAVITY_SESSION_ID: "active" },
      userConfigPath: path.join(configRoot, "platforms.toml")
    });

    const expected = path.join(os.homedir(), ".gemini", "antigravity", "skills");
    assert.deepEqual(roots, [expected]);
    assert.equal(rootLabelForPath(expected), "antigravity");
  } finally {
    fs.rmSync(configRoot, { recursive: true, force: true });
  }
});

test("shared fallback roots stay deduplicated after Gemini removal", () => {
  const configRoot = makeTempRoot();
  try {
    const roots = sharedFallbackRoots(loadPlatformConfigs({
      userConfigPath: path.join(configRoot, "platforms.toml")
    }));

    assert.deepEqual(roots, [path.join(os.homedir(), ".agents", "skills")]);
  } finally {
    fs.rmSync(configRoot, { recursive: true, force: true });
  }
});

test("legacy user Gemini config is parsed only as an explicit user-defined platform", () => {
  const overrides = parsePlatformsToml(`
[platforms.gemini]
base_dir = "~/.agents"
skills_subdir = "skills"
`);

  assert.deepEqual(overrides, {
    gemini: { base_dir: "~/.agents", skills_subdir: "skills" }
  });
});