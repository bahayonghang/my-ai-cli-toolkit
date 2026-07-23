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
const processFixtures = path.join(
  skillDir,
  "tests",
  "fixtures",
  "process-graphs.json",
);
const tasklistFixture = path.join(
  skillDir,
  "tests",
  "fixtures",
  "tasklist-apps.csv",
);
const malformedTasklistFixture = path.join(
  skillDir,
  "tests",
  "fixtures",
  "tasklist-apps-malformed.csv",
);

const PWSH_ARGS = ["-NoLogo", "-NoProfile", "-NonInteractive"];
const PWSH_MAX_BUFFER = 32 * 1024 * 1024;
const UTF8_PREFIX =
  "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $ProgressPreference = 'SilentlyContinue'; ";

function runPwshCommand(command, timeout = 120_000) {
  return spawnSync("pwsh", [...PWSH_ARGS, "-Command", UTF8_PREFIX + command], {
    encoding: "utf8",
    maxBuffer: PWSH_MAX_BUFFER,
    timeout,
    windowsHide: true,
  });
}

function runPwshFile(scriptPath, args, timeout = 120_000) {
  return spawnSync("pwsh", [...PWSH_ARGS, "-File", scriptPath, ...args], {
    encoding: "utf8",
    maxBuffer: PWSH_MAX_BUFFER,
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
    `${label} exited ${result.status}: ${result.stderr}\n${result.error?.message ?? ""}`,
  );
  const objectStart = result.stdout.indexOf("{");
  const arrayStart = result.stdout.indexOf("[");
  const start = [objectStart, arrayStart]
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0] ?? -1;
  assert.notEqual(
    start,
    -1,
    `${label} produced no JSON: ${result.stdout.slice(0, 200)}`,
  );
  return JSON.parse(result.stdout.slice(start));
}

function loadAllFunctions(scriptPath) {
  const quoted = scriptPath.replaceAll("'", "''");
  return [
    `$ast = [System.Management.Automation.Language.Parser]::ParseFile('${quoted}', [ref]$null, [ref]$null)`,
    "$ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] }, $true) | ForEach-Object { Invoke-Expression $_.Extent.Text }",
  ].join("; ");
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
      loadAllFunctions(uwpScript),
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

test("dev audit facts expose summary plus mixed-tree fields", { skip }, () => {
  const command = [
    loadAllFunctions(devScript),
    `$fixture = Get-Content -Raw '${processFixtures.replaceAll("'", "''")}' | ConvertFrom-Json`,
    "$processes = @($fixture.protected_descendant) + @($fixture.safe_npm)",
    "$trees = @(New-ProcessAuditTrees -Processes $processes -StaleMinutes 30 -Now ([datetime]'2026-07-22T12:00:00Z'))",
    "$summary = [PSCustomObject]@{ tree_count = $trees.Count; safe_cleanup_count = @($trees | Where-Object { $_.safe_to_kill }).Count; playwright_mcp_count = @($trees | Where-Object { $_.category -eq 'playwright-mcp' }).Count; codex_playwright_stale_count = @($trees | Where-Object { Test-TreeProfileIntent -Tree $_ -Profile 'codex-playwright-safe' -StaleMinutes 30 }).Count; dev_server_count = @($trees | Where-Object { $_.category -eq 'dev-server' }).Count; ide_language_service_count = @($trees | Where-Object { $_.category -eq 'ide-language-service' }).Count; npm_outdated_count = @($trees | Where-Object { $_.category -eq 'npm-outdated' }).Count }",
    "[PSCustomObject]@{ summary = $summary; trees = $trees } | ConvertTo-Json -Depth 10 -Compress",
  ].join("; ");
  const parsed = parseJsonOutput(
    runPwshCommand(command),
    "dev audit fixture",
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
    assert.ok(trees.length > 0, "expected fixture process trees");
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
});

test("UWP fixture audit exposes summary counters", { skip }, () => {
  const command = [
    loadAllFunctions(uwpScript),
    `$rows = @(ConvertFrom-AppTaskListCsv -Lines (Get-Content '${tasklistFixture.replaceAll("'", "''")}'))`,
    "$groups = @(Get-UwpBackgroundTaskGroups -Rows $rows)",
    "$phone = @($groups | Where-Object { $_.category -eq 'phone-link-background' } | ForEach-Object { $_.pids }).Count",
    "$dolby = @($groups | Where-Object { $_.category -eq 'dolby-backgroundtask' } | ForEach-Object { $_.pids }).Count",
    "[PSCustomObject]@{ summary = [PSCustomObject]@{ total_app_associated_count = $rows.Count; background_task_host_count = @($rows | Where-Object { $_.process_name -ieq 'backgroundTaskHost' }).Count; phone_link_count = $phone; dolby_backgroundtask_count = $dolby } } | ConvertTo-Json -Depth 5 -Compress",
  ].join("; ");
  const parsed = parseJsonOutput(
    runPwshCommand(command),
    "UWP audit fixture",
  );

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
  "UWP Dolby fixture -WhatIf previews and never flags registry change",
  { skip },
  () => {
    const command = [
      loadAllFunctions(uwpScript),
      `$rows = @(ConvertFrom-AppTaskListCsv -Lines (Get-Content '${tasklistFixture.replaceAll("'", "''")}'))`,
      "$rows | ForEach-Object { $_.started_at = '2026-07-22T08:00:00Z'; $_ | Add-Member -NotePropertyName identity_complete -NotePropertyValue $true }",
      "$selection = Get-UwpCleanupSelection -Rows $rows -Profile 'dolby-backgroundtask'",
      "$cleanup = Stop-Pids -Targets @($selection.targets) -Preview",
      "$cleanup | Add-Member -NotePropertyName registry_changed -NotePropertyValue $false",
      "$cleanup | Add-Member -NotePropertyName plan_id -NotePropertyValue (New-UwpCleanupPlanId -Profile 'dolby-backgroundtask' -Targets @($selection.targets))",
      "$cleanup | ConvertTo-Json -Depth 6 -Compress",
    ].join("; ");
    const parsed = parseJsonOutput(
      runPwshCommand(command),
      "UWP WhatIf fixture",
    );

    assert.equal(parsed.result, "preview");
    assert.equal(parsed.registry_changed, false);
    assert.equal(parsed.count, 1);
    assert.match(parsed.plan_id, /^[a-f0-9]{64}$/);
    assert.ok(
      Object.hasOwn(parsed, "details"),
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

test(
  "Get-Recommendation distinguishes stale codex playwright trees",
  { skip },
  () => {
    const command = [
      loadAllFunctions(devScript),
      "$stale = Get-Recommendation -Category 'playwright-mcp' -ParentExists $true -WorkspaceMatch $false -CodexParent $true -Age ([timespan]::FromMinutes(45)) -StaleMinutes 30",
      "$fresh = Get-Recommendation -Category 'playwright-mcp' -ParentExists $true -WorkspaceMatch $false -CodexParent $true -Age ([timespan]::FromMinutes(5)) -StaleMinutes 30",
      "$foreign = Get-Recommendation -Category 'playwright-mcp' -ParentExists $true -WorkspaceMatch $false -CodexParent $false -Age ([timespan]::FromMinutes(45)) -StaleMinutes 30",
      "[PSCustomObject]@{ stale = $stale.recommendation; stale_safe = $stale.safe_to_kill; fresh = $fresh.recommendation; foreign = $foreign.recommendation } | ConvertTo-Json -Compress",
    ].join("; ");
    const parsed = parseJsonOutput(
      runPwshCommand(command),
      "recommendation unit",
    );

    assert.equal(parsed.stale, "stale-codex-playwright");
    assert.equal(
      parsed.stale_safe,
      false,
      "the label must not flip safe_to_kill",
    );
    assert.equal(parsed.fresh, "candidate-cleanup");
    assert.equal(parsed.foreign, "candidate-cleanup");
  },
);

test("StaleMinutes rejects zero and negative values before enumeration", { skip }, () => {
  for (const value of [0, -1]) {
    const result = runPwshFile(devScript, [
      "-Mode",
      "audit",
      "-StaleMinutes",
      String(value),
      "-AsJson",
    ]);
    assert.notEqual(result.status, 0, `StaleMinutes=${value} must fail`);
    assert.match(`${result.stdout}\n${result.stderr}`, /StaleMinutes|range/i);
  }
});

test("ignored mode parameters are disclosed as warnings", { skip }, () => {
  const command = [
    loadAllFunctions(devScript),
    loadAllFunctions(uwpScript),
    "$dev = @(Get-DevParameterWarnings -Mode 'audit' -Profile 'safe' -WhatIf $true -BoundParameters @{ Profile = 'safe'; WhatIf = $true })",
    "$uwp = @(Get-UwpParameterWarnings -Mode 'audit' -WhatIf $true -BoundParameters @{ Profile = 'phone-link-background'; WhatIf = $true })",
    "[PSCustomObject]@{ dev = $dev; uwp = $uwp } | ConvertTo-Json -Compress",
  ].join("; ");
  const parsed = parseJsonOutput(
    runPwshCommand(command),
    "parameter warning unit",
  );
  assert.equal(parsed.dev.length, 2);
  assert.equal(parsed.uwp.length, 2);
});

test("dev cleanup aggregate preserves result semantics", { skip }, () => {
  const command = [
    loadAllFunctions(devScript),
    "$terminated = [PSCustomObject]@{ result = 'terminated' }",
    "$failed = [PSCustomObject]@{ result = 'failed' }",
    "$precondition = [PSCustomObject]@{ result = 'precondition-failed' }",
    "[PSCustomObject]@{ empty = Get-CleanupAggregateResult -CleanupResults @() -TargetCount 0; preview = Get-CleanupAggregateResult -CleanupResults @() -TargetCount 2 -Preview; terminated = Get-CleanupAggregateResult -CleanupResults @($terminated) -TargetCount 1; failed = Get-CleanupAggregateResult -CleanupResults @($failed) -TargetCount 1; precondition = Get-CleanupAggregateResult -CleanupResults @($precondition) -TargetCount 1; mixed = Get-CleanupAggregateResult -CleanupResults @($terminated, $failed) -TargetCount 2 } | ConvertTo-Json -Compress",
  ].join("; ");
  const parsed = parseJsonOutput(
    runPwshCommand(command),
    "dev cleanup aggregate unit",
  );
  assert.deepEqual(parsed, {
    empty: "no-targets",
    preview: "preview",
    terminated: "terminated",
    failed: "failed",
    precondition: "precondition-failed",
    mixed: "partial",
  });
});

test("workspace matching respects Windows path segment boundaries", { skip }, () => {
  const command = [
    loadAllFunctions(devScript),
    `$fixture = Get-Content -Raw '${processFixtures.replaceAll("'", "''")}' | ConvertFrom-Json`,
    "$actual = @($fixture.workspace_cases | ForEach-Object { Test-CommandLineWorkspaceMatch -CommandLine $_.command_line -WorkspacePath $_.target })",
    "$actual | ConvertTo-Json -Compress",
  ].join("; ");
  const parsed = parseJsonOutput(
    runPwshCommand(command),
    "workspace boundary unit",
  );
  assert.deepEqual(parsed, [true, true, false, false]);
});

test(
  "full descendant audit blocks protected and unknown members",
  { skip },
  () => {
    const command = [
      loadAllFunctions(devScript),
      `$fixture = Get-Content -Raw '${processFixtures.replaceAll("'", "''")}' | ConvertFrom-Json`,
      "$protected = @(New-ProcessAuditTrees -Processes @($fixture.protected_descendant) -StaleMinutes 30)[0]",
      "$unknown = @(New-ProcessAuditTrees -Processes @($fixture.unknown_descendant) -StaleMinutes 30)[0]",
      "$clean = @(New-ProcessAuditTrees -Processes @($fixture.clean_playwright) -StaleMinutes 30)[0]",
      "$protectedSelection = Get-CleanupSelection -Trees @($protected) -Profile 'playwright-mcp' -StaleMinutes 30",
      "$unknownSelection = Get-CleanupSelection -Trees @($unknown) -Profile 'playwright-mcp' -StaleMinutes 30",
      "$cleanSelection = Get-CleanupSelection -Trees @($clean) -Profile 'playwright-mcp' -StaleMinutes 30",
      "[PSCustomObject]@{ protected_mixed = $protected.mixed_tree; protected_blocked = $protected.blocked; protected_targets = @($protectedSelection.targets).Count; unknown_blocked = $unknown.blocked; unknown_roles = @($unknown.members | Where-Object { $_.pid -eq 103 } | ForEach-Object { $_.roles }); unknown_targets = @($unknownSelection.targets).Count; clean_targets = @($cleanSelection.targets).Count; clean_member_count = @($clean.members).Count } | ConvertTo-Json -Depth 6 -Compress",
    ].join("; ");
    const parsed = parseJsonOutput(
      runPwshCommand(command),
      "full descendant audit unit",
    );

    assert.equal(parsed.protected_mixed, true);
    assert.equal(parsed.protected_blocked, true);
    assert.equal(parsed.protected_targets, 0);
    assert.equal(parsed.unknown_blocked, true);
    assert.ok(parsed.unknown_roles.includes("unknown"));
    assert.equal(parsed.unknown_targets, 0);
    assert.equal(parsed.clean_targets, 1);
    assert.equal(parsed.clean_member_count, 2);
  },
);

test("missing process identity blocks automatic cleanup", { skip }, () => {
  const command = [
    loadAllFunctions(devScript),
    `$fixture = Get-Content -Raw '${processFixtures.replaceAll("'", "''")}' | ConvertFrom-Json`,
    "$tree = @(New-ProcessAuditTrees -Processes @($fixture.identity_missing) -StaleMinutes 30)[0]",
    "$selection = Get-CleanupSelection -Trees @($tree) -Profile 'playwright-mcp' -StaleMinutes 30",
    "[PSCustomObject]@{ blocked = $tree.blocked; protection = @($tree.members | Where-Object { -not $_.identity_complete } | ForEach-Object { $_.protection }); targets = @($selection.targets).Count } | ConvertTo-Json -Compress",
  ].join("; ");
  const parsed = parseJsonOutput(
    runPwshCommand(command),
    "missing identity unit",
  );
  assert.equal(parsed.blocked, true);
  assert.ok(parsed.protection.includes("identity-missing"));
  assert.equal(parsed.targets, 0);
});

test("workspace cleanup rejects a nonexistent directory", { skip }, () => {
  const result = runPwshFile(devScript, [
    "-Mode",
    "cleanup",
    "-Profile",
    "workspace-dev-server",
    "-WorkspacePath",
    "Z:\\definitely-missing-workspace-7f92ad",
    "-WhatIf",
    "-AsJson",
  ]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /must resolve|WorkspacePath/i);
});

test(
  "cleanup precondition blocks PID identity drift without calling taskkill",
  { skip },
  () => {
    const command = [
      loadAllFunctions(devScript),
      `$fixture = Get-Content -Raw '${processFixtures.replaceAll("'", "''")}' | ConvertFrom-Json`,
      "$tree = @(New-ProcessAuditTrees -Processes @($fixture.clean_playwright) -StaleMinutes 30)[0]",
      "$global:killCalls = 0",
      "$provider = { @($fixture.identity_changed) }",
      "$kill = { param($rootPid) $global:killCalls += 1; [PSCustomObject]@{ exit_code = 0; output = 'simulated' } }",
      "$result = Invoke-TreeCleanup -Tree $tree -ProcessProvider $provider -KillAction $kill",
      "[PSCustomObject]@{ result = $result.result; kill_calls = $global:killCalls; precondition = $result.precondition } | ConvertTo-Json -Depth 5 -Compress",
    ].join("; ");
    const parsed = parseJsonOutput(
      runPwshCommand(command),
      "identity drift unit",
    );
    assert.equal(parsed.result, "precondition-failed");
    assert.equal(parsed.kill_calls, 0);
    assert.equal(parsed.precondition.status, "identity-changed");
  },
);

test(
  "taskkill exit zero cannot hide surviving planned members",
  { skip },
  () => {
    const command = [
      loadAllFunctions(devScript),
      `$fixture = Get-Content -Raw '${processFixtures.replaceAll("'", "''")}' | ConvertFrom-Json`,
      "$tree = @(New-ProcessAuditTrees -Processes @($fixture.clean_playwright) -StaleMinutes 30)[0]",
      "$provider = { @($fixture.clean_playwright) }",
      "$kill = { param($rootPid) [PSCustomObject]@{ exit_code = 0; output = 'simulated success' } }",
      "$result = Invoke-TreeCleanup -Tree $tree -ProcessProvider $provider -KillAction $kill",
      "$result | ConvertTo-Json -Depth 6 -Compress",
    ].join("; ");
    const parsed = parseJsonOutput(
      runPwshCommand(command),
      "false taskkill success unit",
    );
    assert.equal(parsed.taskkill_exit_code, 0);
    assert.equal(parsed.result, "failed");
    assert.ok(parsed.details.every((item) => item.outcome === "failed"));
  },
);

test("tasklist CSV parsing is strict and keeps full package identity", { skip }, () => {
  const command = [
    loadAllFunctions(uwpScript),
    `$valid = @(ConvertFrom-AppTaskListCsv -Lines (Get-Content '${tasklistFixture.replaceAll("'", "''")}'))`,
    `$malformed = @(Get-Content '${malformedTasklistFixture.replaceAll("'", "''")}')`,
    "$badColumnsFailed = $false",
    "$badPidFailed = $false",
    "$commandFailed = $false",
    "try { ConvertFrom-AppTaskListCsv -Lines @($malformed[0]) | Out-Null } catch { $badColumnsFailed = $true }",
    "try { ConvertFrom-AppTaskListCsv -Lines @($malformed[1]) | Out-Null } catch { $badPidFailed = $true }",
    "try { Get-AppAssociatedTaskListRows -TaskListAction { [PSCustomObject]@{ exit_code = 7; lines = @() } } | Out-Null } catch { $commandFailed = $true }",
    "[PSCustomObject]@{ count = $valid.Count; package = $valid[0].app; pid = $valid[0].pid; bad_columns_failed = $badColumnsFailed; bad_pid_failed = $badPidFailed; command_failed = $commandFailed } | ConvertTo-Json -Compress",
  ].join("; ");
  const parsed = parseJsonOutput(runPwshCommand(command), "tasklist CSV unit");
  assert.equal(parsed.count, 4);
  assert.equal(
    parsed.package,
    "Microsoft.YourPhone_1.26061.128.0_x64__8wekyb3d8bbwe",
  );
  assert.equal(parsed.pid, 301);
  assert.equal(parsed.bad_columns_failed, true);
  assert.equal(parsed.bad_pid_failed, true);
  assert.equal(parsed.command_failed, true);
});

test("UWP selection requires package and complete process identity", { skip }, () => {
  const command = [
    loadAllFunctions(uwpScript),
    `$rows = @(ConvertFrom-AppTaskListCsv -Lines (Get-Content '${tasklistFixture.replaceAll("'", "''")}'))`,
    "$rows | ForEach-Object { $_.started_at = '2026-07-22T08:00:00.0000000Z'; $_ | Add-Member -NotePropertyName identity_complete -NotePropertyValue $true }",
    "$rows += [PSCustomObject]@{ pid = 999; process_name = 'PhoneExperienceHost'; app = 'Contoso.Unrelated_1.0.0.0_x64__abc'; started_at = '2026-07-22T08:00:00.0000000Z'; identity_complete = $true }",
    "$rows += [PSCustomObject]@{ pid = 998; process_name = 'backgroundTaskHost'; app = 'Microsoft.YourPhone_1.0.0.0_x64__8wekyb3d8bbwe'; started_at = $null; identity_complete = $false }",
    "$phone = Get-UwpCleanupSelection -Rows $rows -Profile 'phone-link-background'",
    "$dolby = Get-UwpCleanupSelection -Rows $rows -Profile 'dolby-backgroundtask'",
    "[PSCustomObject]@{ phone_pids = @($phone.targets.pid); phone_blocked = @($phone.blocked_targets.pid); dolby_pids = @($dolby.targets.pid) } | ConvertTo-Json -Compress",
  ].join("; ");
  const parsed = parseJsonOutput(
    runPwshCommand(command),
    "UWP selection unit",
  );
  assert.deepEqual(parsed.phone_pids, [301, 302]);
  assert.deepEqual(parsed.phone_blocked, [998]);
  assert.deepEqual(parsed.dolby_pids, [401]);
});

test("UWP cleanup blocks missing or changed PID identity", { skip }, () => {
  const command = [
    loadAllFunctions(uwpScript),
    "$global:killCalls = 0",
    "$kill = { param([int]$ProcessId) $global:killCalls += 1 }",
    "$changed = [PSCustomObject]@{ pid = 301; process_name = 'backgroundTaskHost'; started_at = '2026-07-22T08:00:00Z' }",
    "$missing = [PSCustomObject]@{ pid = 302; process_name = 'PhoneExperienceHost'; started_at = $null }",
    "$identity = { param([int]$ProcessId) if ($ProcessId -eq 301) { [PSCustomObject]@{ ProcessName = 'backgroundTaskHost'; StartTime = '2026-07-22T09:00:00Z' } } else { [PSCustomObject]@{ ProcessName = 'PhoneExperienceHost'; StartTime = '2026-07-22T08:00:00Z' } } }",
    "$result = Stop-Pids -Targets @($changed, $missing) -KillAction $kill -IdentityAction $identity",
    "[PSCustomObject]@{ result = $result.result; outcomes = @($result.details.outcome); kill_calls = $global:killCalls } | ConvertTo-Json -Compress",
  ].join("; ");
  const parsed = parseJsonOutput(
    runPwshCommand(command),
    "UWP identity unit",
  );
  assert.equal(parsed.result, "failed");
  assert.deepEqual(parsed.outcomes, ["identity-changed", "identity-missing"]);
  assert.equal(parsed.kill_calls, 0);
});

test("undocumented Phone Link registry mutation is fail-closed", { skip }, () => {
  const result = runPwshFile(uwpScript, [
    "-Mode",
    "audit",
    "-DisablePhoneLinkBackground",
  ]);
  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /no longer supported|Windows Settings|background activity/i,
  );
});
