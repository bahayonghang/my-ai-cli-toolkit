import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = 'skills/development-workflows/html-artifact/scripts/check_html_artifact.py';

function pythonCommand() {
  const candidates = [process.env.PYTHON, 'python', 'python3', 'py'].filter(Boolean);
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['--version'], { encoding: 'utf8' });
    if (result.status === 0) return candidate;
  }
  return 'python';
}

const python = pythonCommand();

function withTempFile(name, body, fn) {
  const dir = mkdtempSync(join(tmpdir(), 'html-artifact-'));
  const file = join(dir, name);
  writeFileSync(file, body, 'utf8');
  try {
    return fn(file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function run(file, args = []) {
  return spawnSync(python, [script, file, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

const validHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Valid Offline Artifact</title>
  <style>
    :focus-visible { outline: 2px solid #4f46e5; }
    @media (prefers-reduced-motion: reduce) { * { transition-duration: .01ms !important; } }
  </style>
</head>
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <main id="main">
    <h1>Valid Offline Artifact</h1>
    <button type="button" aria-label="Copy summary">Copy</button>
    <table><caption>Validation matrix</caption><thead><tr><th>Item</th></tr></thead><tbody><tr><td>Pass</td></tr></tbody></table>
  </main>
  <script>document.querySelector('button').addEventListener('click', () => {});</script>
</body>
</html>`;

test('valid_offline_artifact_passes', () => {
  withTempFile('valid.html', validHtml, (file) => {
    const result = run(file);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /validation: ok/);
  });
});

test('missing_body_fails', () => {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Bad</title></head><main><h1>Bad</h1></main></html>`;
  withTempFile('missing-body.html', html, (file) => {
    const result = run(file);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /missing <body>/);
  });
});

test('external_script_fails', () => {
  const html = validHtml.replace('</body>', '<script src="https://example.test/app.js"></script></body>');
  withTempFile('external-script.html', html, (file) => {
    const result = run(file);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /script src/);
  });
});

test('remote_stylesheet_fails', () => {
  const html = validHtml.replace('</head>', '<link rel="stylesheet" href="https://example.test/app.css"></head>');
  withTempFile('remote-style.html', html, (file) => {
    const result = run(file);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /<link rel/);
  });
});

test('fetch_call_fails_by_default', () => {
  const html = validHtml.replace('</script>', 'fetch("local.json");</script>');
  withTempFile('fetch.html', html, (file) => {
    const result = run(file);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /fetch/);
  });
});

test('allow_external_flag_allows_http_but_not_missing_structure', () => {
  const withHttp = validHtml.replace('<main id="main">', '<p>https://example.test/reference</p><main id="main">');
  withTempFile('allowed-http.html', withHttp, (file) => {
    const result = run(file, ['--allow-external']);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  });

  const missingStructure = `<html><head><meta charset="utf-8"><title>Missing</title></head><body><h1>Missing main</h1></body></html>`;
  withTempFile('missing-main.html', missingStructure, (file) => {
    const result = run(file, ['--allow-external']);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /missing <main>/);
  });
});

test('inline_svg_with_xmlns_passes', () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" aria-label="diagram"><rect width="40" height="40" fill="#4f46e5"/></svg>';
  const html = validHtml.replace('</h1>', '</h1>' + svg);
  withTempFile('svg-xmlns.html', html, (file) => {
    const result = run(file);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /validation: ok/);
  });
});

test('main_without_id_fails', () => {
  const html = validHtml.replace('<main id="main">', '<main>');
  withTempFile('main-no-id.html', html, (file) => {
    const result = run(file);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /id="main"/);
  });
});

test('missing_viewport_fails', () => {
  const html = validHtml.replace(/\s*<meta name="viewport"[^>]*>/, '');
  withTempFile('no-viewport.html', html, (file) => {
    const result = run(file);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /viewport/);
  });
});

test('preload_link_fails', () => {
  const html = validHtml.replace('</head>', '<link rel="preload" as="style" href="/x.css"></head>');
  withTempFile('preload-link.html', html, (file) => {
    const result = run(file);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /<link rel/);
  });
});
