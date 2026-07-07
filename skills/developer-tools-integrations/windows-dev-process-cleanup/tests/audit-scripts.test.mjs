// Regression tests for the windows-dev-process-cleanup PowerShell scripts.
// Requires Windows + PowerShell 7 (pwsh); skips cleanly anywhere else.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(__dirname, "..");
const devScript = path.join(skillDir, "scripts", "audit-dev-processes.ps1");
const uwpScript = path.join(
  skillDir,
  "scripts",
  "audit-uwp-backgroundtasks.ps1",
);

const PWSH_ARGS = ["-NoLogo", "-NoProfile", "-NonInteractive"];
const UTF8_PREFIX =
  "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $ProgressPreference = 'SilentlyContinue'; ";

function runPwshCommand(command, timeout = 120_000) {
  return spawnSync("pwsh", [...PWSH_ARGS, "-Command", UTF8_PREFIX + command], {
    encoding: "utf8",
    timeout,
    windowsHide: true,
  });
}

function runPwshFile(scriptPath, args, timeout = 120_000) {
  return spawnSync("pwsh", [...PWSH_ARGS, "-File", scriptPath, ...args], {
    encoding: "utf8",
    timeout,
    windowsHide: true,
  });
}

function pwshAvailable() {
  try {
    const probe = spawnSync(
      "pwsh",
      [...PWSH_ARGS, "-Command", "$PSVersionTable.PSVersion.Major"],
      {
        encoding: "utf8",
        timeout: 30_000,
        windowsHide: true,
      },
    );
    return probe.status === 0 && Number.parseInt(probe.stdout.trim(), 10) >= 7;
  } catch {
    return false;
  }
}

const skip =
  process.platform !== "win32"
    ? "requires Windows"
    : pwshAvailable()
      ? false
      : "requires PowerShell 7 (pwsh) on PATH";

function parseJsonOutput(result, label) {
  assert.equal(
    result.status,
    0,
    `${label} exited ${result.status}: ${result.stderr}`,
  );
  const start = result.stdout.indexOf("{");
  assert.notEqual(
    start,
    -1,
    `${label} produced no JSON: ${result.stdout.slice(0, 200)}`,
  );
  return JSON.parse(result.stdout.slice(start));
}

test("parse gate: both scripts parse without syntax errors", { skip }, () => {
  for (const script of [devScript, uwpScript]) {
    const result = runPwshCommand(
      `$errs = $null; ` +
        `$null = [System.Management.Automation.Language.Parser]::ParseFile('${script.replaceAll("'", "''")}', [ref]$null, [ref]$errs); ` +
        `if ($errs.Count) { $errs | ForEach-Object { $_.Message }; exit 1 } else { 'parse-ok' }`,
    );
    assert.equal(
      result.status,
      0,
      `${path.basename(script)} has parse errors: ${result.stdout} ${result.stderr}`,
    );
    assert.match(result.stdout, /parse-ok/);
  }
});

test(
  "Stop-Pids binds TargetPids, dedups, and reports per-PID outcomes",
  { skip },
  () => {
    // Regression for the original `Stop-Pids -Pids ...` call: the PID list fell
    // into $args and cleanup silently terminated nothing while claiming success.
    const command = [
      `. '${uwpScript.replaceAll("'", "''")}' *> $null`,
      "$global:seen = @()",
      "$shim = { param([int]$ProcessId) $global:seen += $ProcessId; if ($ProcessId -eq 999) { 'failed' } else { 'terminated' } }",
      "$r = Stop-Pids -TargetPids @(5, 5, 3, 999) -KillAction $shim",
      "$empty = Stop-Pids -TargetPids @() -KillAction $shim",
      "[PSCustomObject]@{ seen = @($global:seen); result = $r.result; count = $r.count; pids = @($r.pids); outcomes = @($r.details | ForEach-Object { $_.outcome }); empty_result = $empty.result; empty_count = $empty.count } | ConvertTo-Json -Compress",
    ].join("; ");
    const parsed = parseJsonOutput(runPwshCommand(command), "Stop-Pids unit");

    assert.deepEqual(
      parsed.seen,
      [3, 5, 999],
      "kill action must receive the deduped, sorted PID list",
    );
    assert.deepEqual(parsed.pids, [3, 5, 999]);
    assert.equal(parsed.count, 3);
    assert.deepEqual(parsed.outcomes, ["terminated", "terminated", "failed"]);
    assert.equal(
      parsed.result,
      "partial",
      "one surviving PID must downgrade the aggregate to partial",
    );
    assert.equal(parsed.empty_result, "no-targets");
    assert.equal(parsed.empty_count, 0);
  },
);

test("Get-CategoryFromLines classifies known command lines", { skip }, () => {
  // Extract only the function definition via the PowerShell AST so the unit
  // test does not pay for the script's top-level CIM process enumeration.
  const command = [
    "$ast = [System.Management.Automation.Language.Parser]::ParseFile(" +
      `'${devScript.replaceAll("'", "''")}', [ref]$null, [ref]$null)`,
    "$fn = $ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq 'Get-CategoryFromLines' }, $true) | Select-Object -First 1",
    "if (-not $fn) { throw 'Get-CategoryFromLines not found in script' }",
    "Invoke-Expression $fn.Extent.Text",
    "$out = [ordered]@{}",
    "$out.npm_outdated = Get-CategoryFromLines -Lines @('C:\\Program Files\\nodejs\\npm.exe outdated')",
    "$out.playwright = Get-CategoryFromLines -Lines @('npx @playwright/mcp@latest')",
    "$out.dev_server = Get-CategoryFromLines -Lines @('node C:\\proj\\node_modules\\.bin\\vite')",
    "$out.ide = Get-CategoryFromLines -Lines @('node C:\\ext\\typingsInstaller.js')",
    "$out.generic = Get-CategoryFromLines -Lines @('cmd /c echo hi')",
    "$out.tree_first_match = Get-CategoryFromLines -Lines @('npm.exe outdated', 'npm run dev')",
    "[PSCustomObject]$out | ConvertTo-Json -Compress",
  ].join("; ");
  const parsed = parseJsonOutput(
    runPwshCommand(command),
    "classification unit",
  );

  assert.equal(parsed.npm_outdated, "npm-outdated");
  assert.equal(parsed.playwright, "playwright-mcp");
  assert.equal(parsed.dev_server, "dev-server");
  assert.equal(parsed.ide, "ide-language-service");
  assert.equal(parsed.generic, "generic");
  // Joined-lines first-match is why member-level mixed_tree guarding exists.
  assert.equal(parsed.tree_first_match, "npm-outdated");
});

test(
  "dev audit -AsJson exposes summary plus mixed-tree fields",
  { skip },
  () => {
    const command = `& '${devScript.replaceAll("'", "''")}' -Mode audit -AsJson`;
    const parsed = parseJsonOutput(
      runPwshCommand(command, 180_000),
      "dev audit",
    );

    for (const key of [
      "tree_count",
      "safe_cleanup_count",
      "playwright_mcp_count",
      "codex_playwright_stale_count",
      "dev_server_count",
      "ide_language_service_count",
      "npm_outdated_count",
    ]) {
      assert.ok(
        Object.hasOwn(parsed.summary, key),
        `summary is missing ${key}`,
      );
    }
    const trees = Array.isArray(parsed.trees)
      ? parsed.trees
      : [parsed.trees].filter(Boolean);
    assert.ok(
      trees.length > 0,
      "expected at least one process tree on a live machine",
    );
    for (const field of [
      "mixed_tree",
      "member_categories",
      "safe_to_kill",
      "kill_recommendation",
    ]) {
      assert.ok(
        Object.hasOwn(trees[0], field),
        `tree entries are missing ${field}`,
      );
    }
  },
);

test("uwp audit -AsJson exposes summary counters", { skip }, () => {
  const command = `& '${uwpScript.replaceAll("'", "''")}' -Mode audit -AsJson`;
  const parsed = parseJsonOutput(runPwshCommand(command, 180_000), "uwp audit");

  for (const key of [
    "total_app_associated_count",
    "background_task_host_count",
    "phone_link_count",
    "dolby_backgroundtask_count",
  ]) {
    assert.ok(Object.hasOwn(parsed.summary, key), `summary is missing ${key}`);
  }
});

test(
  "uwp dolby cleanup -WhatIf previews and never flags registry change",
  { skip },
  () => {
    const command = `& '${uwpScript.replaceAll("'", "''")}' -Mode cleanup -Profile dolby-backgroundtask -WhatIf -AsJson`;
    const parsed = parseJsonOutput(
      runPwshCommand(command, 180_000),
      "uwp WhatIf cleanup",
    );

    assert.equal(parsed.cleanup.result, "preview");
    assert.equal(parsed.cleanup.registry_changed, false);
    assert.ok(
      Object.hasOwn(parsed.cleanup, "details"),
      "cleanup result must carry per-PID details",
    );
  },
);

test("uwp cleanup without an explicit profile fails fast", { skip }, () => {
  const result = runPwshFile(uwpScript, ["-Mode", "cleanup"]);
  assert.notEqual(
    result.status,
    0,
    "cleanup without -Profile must exit non-zero",
  );
  assert.match(`${result.stdout}\n${result.stderr}`, /Profile is required/);
});

// Doc lint: platform-independent, so no skip gate.
test("SKILL.md keeps repo conventions (skill-dir paths, full frontmatter)", () => {
  const skillMd = readFileSync(path.join(skillDir, "SKILL.md"), "utf8");
  assert.doesNotMatch(
    skillMd,
    /-File\s+"?scripts\//,
    "commands must reference scripts via the skill-dir placeholder, not bare relative paths",
  );
  const frontmatter = skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(frontmatter, "SKILL.md must start with YAML frontmatter");
  for (const key of [
    "name:",
    "description:",
    "category:",
    "tags:",
    "version:",
  ]) {
    assert.ok(frontmatter[1].includes(key), `frontmatter is missing ${key}`);
  }
});
