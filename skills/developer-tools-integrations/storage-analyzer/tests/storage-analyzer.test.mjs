import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(__dirname, "..");
const scanScript = path.join(skillDir, "scripts", "scan.py");
const reportScript = path.join(skillDir, "scripts", "build_report.py");
const serverScript = path.join(skillDir, "scripts", "server.py");

function detectPython() {
  const candidates = [
    { command: "python3", prefix: [] },
    { command: "python", prefix: [] },
    { command: "py", prefix: ["-3"] },
    { command: "py", prefix: [] },
  ];
  for (const candidate of candidates) {
    const probe = spawnSync(candidate.command, [...candidate.prefix, "-c", "import sys"], {
      stdio: "ignore",
    });
    if (!probe.error && probe.status === 0) return candidate;
  }
  return null;
}

const python = detectPython();
const skip = python ? false : "requires a Python interpreter (tried python3, python, py -3, py)";
const TOKEN_SENTINEL = "token-should-not-appear-in-static-report";

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "storage-analyzer-"));
}

function writeFile(root, rel, contents = "x".repeat(2048)) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
  return full;
}

function runPython(script, args, extraEnv = {}) {
  return spawnSync(python.command, [...python.prefix, "-X", "utf8", script, ...args], {
    encoding: "utf8",
    env: { ...process.env, PYTHONUTF8: "1", ...extraEnv },
  });
}

function scanEnv(home) {
  const local = path.join(home, "AppData", "Local");
  const roaming = path.join(home, "AppData", "Roaming");
  const temp = path.join(local, "Temp");
  fs.mkdirSync(temp, { recursive: true });
  fs.mkdirSync(roaming, { recursive: true });
  fs.mkdirSync(path.join(home, "Downloads"), { recursive: true });
  return {
    USERPROFILE: home,
    HOME: home,
    LOCALAPPDATA: local,
    APPDATA: roaming,
    TEMP: temp,
    TMP: temp,
  };
}

function validAnalysis(home, extra = {}) {
  return {
    generated_at: "2026-09-02 00:00:00",
    scan_seconds: 1,
    system: {
      os: "Windows 10",
      home,
      disk_total: "100 GB",
      disk_used: "40 GB",
      disk_free: "60 GB",
    },
    top5: [],
    green: extra.green || [],
    yellow: extra.yellow || [],
    red: extra.red || [],
    summary: {
      overview: "overview",
      tier_stats: { green: "约 1.0 GB", yellow: "约 0 GB", red: "约 0 GB" },
      priority: ["clear temp"],
      long_term: ["storage sense"],
    },
  };
}

test("SKILL.md uses skill-dir and forbids tmp capture", () => {
  const text = fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf8");
  assert.match(text, /<skill-dir>/);
  assert.doesNotMatch(text, /\/tmp\//);
  assert.doesNotMatch(text, /python3 scripts\//);
  assert.match(text, /this-turn approval/);
  assert.match(text, /server\.py/);
});

test("relative --output is rejected", { skip }, () => {
  const result = runPython(scanScript, ["--output", "scan.json"]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /absolute path/);
});

test("unsupported platform JSON on linux", { skip: skip || (process.platform === "linux" ? false : "linux-only") }, () => {
  const result = runPython(scanScript, []);
  assert.equal(result.status, 2);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.error, "unsupported_platform");
});

test("windows hotspot scan skips Program Files and junctions", { skip: skip || (process.platform === "win32" ? false : "requires Windows") }, () => {
  const home = tmpDir();
  const env = scanEnv(home);
  writeFile(home, path.join("AppData", "Local", "Foo", "blob.bin"));
  writeFile(home, path.join("Downloads", "setup.bin"));
  const npmCache = writeFile(home, path.join(".npm", "index.bin"));
  const programFiles = path.join(tmpDir(), "Program Files");
  writeFile(programFiles, path.join("BigApp", "app.bin"));
  env.ProgramFiles = programFiles;
  env.PROGRAMFILES = programFiles;
  const programFilesX86 = path.join(tmpDir(), "Program Files (x86)");
  fs.mkdirSync(programFilesX86, { recursive: true });
  env["ProgramFiles(x86)"] = programFilesX86;
  env["PROGRAMFILES(X86)"] = programFilesX86;

  const realDir = path.join(env.LOCALAPPDATA, "RealDir");
  fs.mkdirSync(realDir, { recursive: true });
  writeFile(realDir, "blob.bin");
  const junction = path.join(env.LOCALAPPDATA, "LinkDir");
  fs.symlinkSync(realDir, junction, "junction");

  const out = path.join(tmpDir(), "scan.json");
  const result = runPython(scanScript, ["--output", out, "--min-kb", "1"], env);
  assert.equal(result.status, 0, result.stderr);
  const scan = JSON.parse(fs.readFileSync(out, "utf8"));
  assert.ok(scan.groups);
  assert.equal(scan.groups.program_files, undefined);
  assert.ok(Array.isArray(scan.denied));
  const localNames = (scan.groups.appdata_local || []).map((row) => row.name);
  assert.ok(localNames.includes("Foo") || localNames.includes("RealDir"));
  assert.equal(localNames.includes("LinkDir"), false);
  const devNames = (scan.groups.dev_caches || []).map((row) => row.path.toLowerCase());
  assert.ok(devNames.some((item) => item.includes(".npm")));
  assert.ok(fs.existsSync(npmCache));

  const withApps = path.join(tmpDir(), "scan-apps.json");
  const flagged = runPython(
    scanScript,
    [
      "--output",
      withApps,
      "--min-kb",
      "1",
      "--include-system-apps",
      "--program-files",
      programFiles,
      "--program-files-x86",
      programFilesX86,
    ],
    env,
  );
  assert.equal(flagged.status, 0, flagged.stderr);
  const scanApps = JSON.parse(fs.readFileSync(withApps, "utf8"));
  assert.ok(Array.isArray(scanApps.groups.program_files));
  assert.ok(scanApps.groups.program_files.some((row) => row.name === "BigApp"));
});

test("build_report rejects missing schema and writes nothing", { skip }, () => {
  const dir = tmpDir();
  const src = path.join(dir, "bad.json");
  const out = path.join(dir, "report.html");
  fs.writeFileSync(src, JSON.stringify({ system: { home: dir } }), "utf8");
  const result = runPython(reportScript, [src, "--output", out]);
  assert.equal(result.status, 2);
  assert.equal(fs.existsSync(out), false);
});

test("green trash outside cache prefixes is rejected", { skip }, () => {
  const home = tmpDir();
  const env = scanEnv(home);
  const secret = writeFile(home, path.join("Documents", "secret.txt"));
  const analysisPath = path.join(tmpDir(), "analysis.json");
  fs.writeFileSync(
    analysisPath,
    JSON.stringify(validAnalysis(home, { green: [{ name: "docs", trash_paths: [secret] }] })),
    "utf8",
  );
  const out = path.join(tmpDir(), "report.html");
  const report = runPython(reportScript, [analysisPath, "--output", out], env);
  assert.equal(report.status, 2);
  assert.match(report.stderr, /trash_paths rejected/);
  assert.equal(fs.existsSync(out), false);

  const check = runPython(serverScript, [analysisPath, "--check-allowlist"], env);
  assert.equal(check.status, 2);
  const payload = JSON.parse(check.stdout);
  assert.equal(payload.ok, false);
  assert.equal(payload.rm_allowed, false);
  assert.ok(payload.rejected.length > 0);
});

test("temp prefix green trash and script injection", { skip }, () => {
  const home = tmpDir();
  const env = scanEnv(home);
  const cacheFile = writeFile(env.TEMP, path.join("pip-cache", "wheel.bin"));
  const analysisPath = path.join(tmpDir(), "analysis.json");
  const analysis = validAnalysis(home, {
    green: [
      {
        name: "</script><script>alert(1)</script>",
        path: cacheFile,
        trash_paths: [cacheFile],
        size_estimate: "约 1 MB",
      },
    ],
  });
  fs.writeFileSync(analysisPath, JSON.stringify(analysis), "utf8");
  const out = path.join(tmpDir(), "report.html");
  const report = runPython(reportScript, [analysisPath, "--output", out], env);
  assert.equal(report.status, 0, report.stderr);
  const html = fs.readFileSync(out, "utf8");
  assert.equal(html.includes("</script><script>alert(1)</script>"), false);
  assert.ok(html.includes("\\u003c"));
  assert.equal(html.includes(TOKEN_SENTINEL), false);
  assert.doesNotMatch(html, /"token":/);

  const check = runPython(serverScript, [analysisPath, "--check-allowlist"], env);
  assert.equal(check.status, 0, check.stderr);
  const payload = JSON.parse(check.stdout);
  assert.equal(payload.ok, true);
  assert.equal(payload.rm_allowed, false);
});

test("static report has no delete buttons", { skip }, () => {
  const home = tmpDir();
  const env = scanEnv(home);
  const cacheFile = writeFile(env.TEMP, "a.bin");
  const analysisPath = path.join(tmpDir(), "analysis.json");
  fs.writeFileSync(
    analysisPath,
    JSON.stringify(
      validAnalysis(home, { green: [{ name: "temp", path: cacheFile, trash_paths: [cacheFile] }] }),
    ),
    "utf8",
  );
  const out = path.join(tmpDir(), "report.html");
  const report = runPython(reportScript, [analysisPath, "--output", out], env);
  assert.equal(report.status, 0, report.stderr);
  const html = fs.readFileSync(out, "utf8");
  assert.match(html, /直接删除已禁用|v1 不提供硬删除|移到废纸篓/);
  assert.doesNotMatch(html, /onclick="doDelete\(this,'rm'\)"/);
});

test("windows shfileop buffer keeps extra NUL", { skip: skip || (process.platform === "win32" ? false : "requires Windows") }, () => {
  const sample = path.join(tmpDir(), "target");
  fs.mkdirSync(sample);
  const result = runPython(serverScript, ["--print-shfileop-buffer", sample]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.ok(payload.buffer_wchars >= payload.path_chars + 2);
});
