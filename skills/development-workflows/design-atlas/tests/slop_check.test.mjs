// Tests for scripts/slop_check.mjs. Run with `node --test` (Node >= 20).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { run, TIERS, CLASSES, IMPLEMENTED, parseYaml } from '../scripts/slop_check.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL = dirname(HERE);
const FIX = join(HERE, 'fixtures', 'slop');
const SCRIPT = join(SKILL, 'scripts', 'slop_check.mjs');

const PLAIN_DESIGN = `---
name: Case
description: Inline test case.
colors:
  paper: "#f6f4ef"
  ink: "#1d1b18"
typography:
  display:
    fontFamily: Fraunces
  body:
    fontFamily: Public Sans
---

## Overview

Inline case page.
`;

const BASE_TOKENS = `--color-paper: oklch(97% 0.01 80); --color-ink: oklch(22% 0.02 80); --font-display: "Fraunces", serif; --font-body: "Public Sans", sans-serif;`;

function page({ css = '', body = '', tokens = '', clip = true } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Case</title>
<style>
:root { ${BASE_TOKENS} ${tokens} }
${clip ? 'html, body { overflow-x: clip; }' : ''}
body { background: var(--color-paper); color: var(--color-ink); font-family: var(--font-body); }
${css}
</style>
</head>
<body>
${body}
</body>
</html>
`;
}

function withProject(files, fn) {
  const dir = mkdtempSync(join(tmpdir(), 'slop-check-'));
  try {
    if (!('DESIGN.md' in files)) writeFileSync(join(dir, 'DESIGN.md'), PLAIN_DESIGN);
    for (const [name, content] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, name)), { recursive: true });
      writeFileSync(join(dir, name), content);
    }
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const check = (dir, extra = []) => run([dir, ...extra], { cwd: dir });
const hits = (r, gate, grades = ['FAIL', 'REFLEX', 'WARN']) => r.findings.filter((f) => f.gate === gate && grades.includes(f.grade));

// Every implemented gate: one page that trips it, one that does not.
const CASES = {
  '1': [{ tokens: '--font-display: "Inter", sans-serif;' }, {}],
  '2a': [
    { tokens: '--a: #8b5cf6; --b: #3b82f6;', css: '.hero { background: linear-gradient(90deg, var(--a), var(--b)); }', body: '<div class="hero">Harbour</div>' },
    { tokens: '--a: oklch(70% 0.1 60); --b: oklch(60% 0.1 40);', css: '.hero { background: linear-gradient(90deg, var(--a), var(--b)); }', body: '<div class="hero">Harbour</div>' },
  ],
  '2b': [
    { tokens: '--a: oklch(70% 0.1 60); --b: oklch(60% 0.1 40);', css: '.t { background: linear-gradient(90deg, var(--a), var(--b)); -webkit-background-clip: text; background-clip: text; color: transparent; }', body: '<h1 class="t">Harbour</h1>' },
    { css: '.t { color: var(--color-ink); }', body: '<h1 class="t">Harbour</h1>' },
  ],
  '4': [{ body: '<div class="card"><div class="card">Tide</div></div>' }, { body: '<div class="card-grid"><div class="card">Tide</div></div>' }],
  '7a': [{ css: '.x { color: #fff; }', body: '<p class="x">Tide</p>' }, { css: '.x { color: var(--color-ink); }', body: '<p class="x">Tide</p>' }],
  '10a': [{ css: '.x { transition: all .2s; }' }, { css: '.x { transition: opacity .2s; }' }],
  '10b': [{ css: '.x { transition: padding .2s; }' }, { css: '.x { transition: transform .2s; }' }],
  '12': [{ css: '.btn:hover { transition: transform .2s cubic-bezier(.3, 1.6, .6, 1); }' }, { css: '.btn:hover { transition: transform .2s cubic-bezier(.2, .8, .2, 1); }' }],
  '15': [
    { css: '.btn:focus-visible { outline: 2px solid var(--color-ink); transition: outline .2s; }' },
    { css: '.btn:focus-visible { outline: 2px solid var(--color-ink); }' },
  ],
  '19': [{ body: '<p>Seamless sync for every crew.</p>' }, { body: '<p>Sync runs every five minutes.</p><p>同步——每五分钟一次。</p>' }],
  '26a': [
    { body: '<button>Save the log</button>', css: 'button:active { color: var(--color-ink); }' },
    { body: '<button>Save the log</button>', css: 'button:focus-visible { outline: 2px solid var(--color-ink); } button:active { color: var(--color-ink); }' },
  ],
  '26b': [
    { body: '<a href="/log">Open the log</a>', css: 'a:focus-visible { outline: 2px solid var(--color-ink); }' },
    { body: '<a href="/log">Open the log</a>', css: 'a:focus-visible { outline: 2px solid var(--color-ink); } a:active { color: var(--color-ink); }' },
  ],
  '27': [
    { css: '@keyframes k { from { opacity: 0; } to { opacity: 1; } } .x { animation: k 1s; }' },
    { css: '@keyframes k { from { opacity: 0; } to { opacity: 1; } } .x { animation: k 1s; } @media (prefers-reduced-motion: reduce) { .x { animation: none; } }' },
  ],
  '28a': [{ body: '<video autoplay src="tide.mp4"></video>' }, { body: '<video autoplay muted loop playsinline poster="tide.jpg" src="tide.mp4"></video>' }],
  '30a': [{ body: '<div class="feature__icon">✨</div>' }, { body: '<div class="feature__icon"><svg aria-hidden="true"></svg></div>' }],
  '30b': [{ body: '<i class="fa-solid fa-anchor"></i><i data-lucide="ship" class="lucide"></i>' }, { body: '<i class="fa-solid fa-anchor"></i><i class="fa-solid fa-ship"></i>' }],
  '33': [{ body: '<svg viewBox="0 0 4 4"></svg>' }, { body: '<svg aria-hidden="true" viewBox="0 0 4 4"></svg>' }],
  '34': [{ clip: false, css: 'body { overflow-x: hidden; }' }, {}],
  '37': [
    { tokens: '--font-mono: "JetBrains Mono", monospace; --font-accent: "Playfair Display", serif;' },
    { tokens: '--font-mono: "JetBrains Mono", monospace;' },
  ],
  '38i': [{ body: '<h2>Fast <em>sync</em></h2>' }, { body: '<h2>Fast sync</h2>' }],
  '39a': [
    { body: '<input name="q">', css: 'input { border: 1px solid var(--color-ink); } input:focus { border: 2px solid var(--color-ink); }' },
    { body: '<input name="q">', css: 'input { border: 1px solid var(--color-ink); } input:focus { outline: 2px solid var(--color-ink); }' },
  ],
  '47a': [{ body: '<div class="browser-bar"></div>' }, { body: '<figure><img alt="The dashboard" src="shot.png"></figure>' }],
  '47b': [{ body: '<div class="phone-frame"><img alt="App" src="a.png"></div>' }, { body: '<div class="shot"><img alt="App" src="a.png"></div>' }],
  '48': [{ css: '.x { color: #336699; }' }, { css: '.x { color: var(--color-ink); }' }],
  '50': [
    { css: '.g { display: grid; grid-template-columns: 1fr 1fr; }', body: '<div class="g"><img alt="Tide" src="a.png"><img alt="Bay" src="b.png"></div>' },
    { css: '.g { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }', body: '<div class="g"><img alt="Tide" src="a.png"><img alt="Bay" src="b.png"></div>' },
  ],
  '53': [
    { css: 'input[type="radio"] { position: absolute; top: 0; }', body: '<input type="radio" name="t">' },
    { css: 'input[type="radio"] { position: absolute; width: 0; height: 0; }', body: '<input type="radio" name="t">' },
  ],
  '54': [
    { body: '<section><p class="eyebrow">Features</p><h2>Tide tables</h2></section>' },
    { body: '<section><h2>Tide tables</h2><p>Updated each morning.</p></section>' },
  ],
  '55a': [{ css: 'h2 { text-transform: uppercase; line-height: .9; }' }, { css: 'h2 { text-transform: uppercase; line-height: 1.1; }' }],
  '62': [{ css: '.reveal { opacity: 0; }', body: '<p class="reveal">Tide</p>' }, { css: '.js .reveal { opacity: 0; }', body: '<p class="reveal">Tide</p>' }],
  '63': [{ body: '<p>Docs · Blog · News</p>' }, { body: '<p>Docs and news</p>' }],
  '64': [
    { tokens: '--font-mono: "JetBrains Mono", monospace;', css: '.label { font-family: var(--font-mono); }', body: '<p class="label">Crew notes</p>' },
    { tokens: '--font-mono: "JetBrains Mono", monospace;', css: '.label { font-family: var(--font-body); }', body: '<p class="label">Crew notes</p>' },
  ],
  '67': [
    { css: '.label { text-transform: uppercase; letter-spacing: .1em; font-size: 12px; }', body: '<p class="label">Crew notes</p>' },
    { css: '.label { font-size: 14px; }', body: '<p class="label">Crew notes</p>' },
  ],
  '74': [{ css: '.x { border-color: #6366f1; }' }, { css: '.x { border-color: var(--color-ink); }' }],
};

test('every implemented gate has an inline case', () => {
  assert.deepEqual([...IMPLEMENTED].sort(), Object.keys(CASES).sort());
});

for (const [gate, [bad, good]] of Object.entries(CASES)) {
  test(`gate ${gate} trips on the bad case and stays quiet on the good one`, () => {
    withProject({ 'index.html': page(bad) }, (dir) => {
      const r = check(dir);
      assert.ok(hits(r, gate).length > 0, `expected gate ${gate}:\n${r.output}`);
      const expected = TIERS[gate] === 'reflex' ? 'REFLEX' : null;
      if (expected && gate !== '28a') assert.ok(hits(r, gate).every((f) => f.grade === expected), `reflex gate ${gate} must report REFLEX`);
    });
    withProject({ 'index.html': page(good) }, (dir) => {
      const r = check(dir);
      assert.equal(hits(r, gate).length, 0, `gate ${gate} fired on the good case:\n${r.output}`);
    });
  });
}

test('tier table in references/anti-slop.md matches TIERS and CLASSES', () => {
  const md = readFileSync(join(SKILL, 'references', 'anti-slop.md'), 'utf8');
  const start = md.indexOf('## 3. Gate table');
  const end = md.indexOf('\n## ', start + 5);
  const rows = md.slice(start, end).split('\n').filter((l) => /^\|\s*[\w]+\s*\|\s*(Floor|House|Reflex|Finish)\s*\|/.test(l));
  const table = {};
  for (const row of rows) {
    const [gate, tier, cls] = row.split('|').slice(1, 4).map((c) => c.trim());
    assert.ok(!(gate in table), `gate ${gate} listed twice`);
    table[gate] = { tier: tier.toLowerCase(), cls };
  }
  assert.deepEqual(Object.keys(table).sort(), Object.keys(TIERS).sort(), 'gate sets differ');
  for (const [gate, { tier, cls }] of Object.entries(table)) {
    assert.equal(TIERS[gate], tier, `tier of ${gate}`);
    assert.equal(CLASSES[gate], cls, `class of ${gate}`);
  }
});

// Fixture pages adapted from hallmark.
test('slopped fixture fails at least ten distinct gates', () => {
  const r = check(join(FIX, 'slopped'));
  assert.equal(r.code, 1);
  const gates = new Set(r.findings.filter((f) => f.grade === 'FAIL' || f.grade === 'REFLEX').map((f) => f.gate));
  assert.ok(gates.size >= 10, `only ${[...gates].join(', ')}`);
  for (const g of ['2a', '4', '10a', '15', '19', '30a', '33', '34', '38i', '48', '50', '55a', '1', '64', '74']) assert.ok(gates.has(g), `slopped misses ${g}`);
});

test('eyebrow-fail flags six eyebrows; eyebrow-pass flags none', () => {
  assert.equal(hits(check(join(FIX, 'eyebrow-fail')), '54', ['FAIL']).length, 6);
  const pass = check(join(FIX, 'eyebrow-pass'));
  assert.equal(hits(pass, '54').length, 0, pass.output);
  assert.equal(pass.code, 0, pass.output);
});

test('tailwind-fail trips the utility tells; tailwind-pass is clean', () => {
  const r = check(join(FIX, 'tailwind-fail'));
  assert.equal(r.code, 1);
  for (const g of ['2a', '2b', '10a', '12', '27', '34', '48', '54', '64', '67', '74']) assert.ok(hits(r, g).length > 0, `tailwind-fail misses ${g}`);
  const files = new Set(r.findings.map((f) => f.file.split('/').pop()));
  for (const f of ['index.html', 'Hero.tsx', 'Feature.vue']) assert.ok(files.has(f), `no finding from ${f}`);
  const pass = check(join(FIX, 'tailwind-pass'));
  assert.equal(pass.code, 0, pass.output);
});

test('declared material: mono x-theme waives 64, Inter display waives 1', () => {
  const mono = check(join(FIX, 'mono-theme'));
  const m64 = mono.findings.filter((f) => f.gate === '64');
  assert.ok(m64.length > 0 && m64.every((f) => f.grade === 'WAIVED' && f.waiver === 'declared'), mono.output);
  assert.equal(mono.code, 0, mono.output);
  const inter = check(join(FIX, 'inter-declared'));
  const i1 = inter.findings.filter((f) => f.gate === '1');
  assert.ok(i1.length > 0 && i1.every((f) => f.grade === 'WAIVED' && f.waiver === 'declared'), inter.output);
  assert.equal(inter.code, 0, inter.output);
});

test('manual waivers: valid one honoured, Floor / short / malformed rejected', () => {
  const r = check(join(FIX, 'waiver'));
  const g1 = r.findings.filter((f) => f.gate === '1');
  assert.ok(g1.length > 0 && g1.every((f) => f.grade === 'WAIVED' && f.waiver === 'manual'), r.output);
  const notes = r.findings.filter((f) => f.grade === 'NOTE');
  assert.ok(notes.some((n) => n.gate === '27' && n.rule === 'waiver-rejected' && /Floor/.test(n.message)));
  assert.ok(notes.some((n) => n.gate === '64' && /24 characters/.test(n.message)));
  assert.ok(notes.some((n) => /malformed/.test(n.message)));
  assert.equal(r.code, 0, r.output);
});

test('a Floor waiver is refused and gate 27 stays FAIL', () => {
  const r = check(join(FIX, 'waive-floor'));
  assert.ok(hits(r, '27', ['FAIL']).length > 0, r.output);
  assert.ok(r.findings.some((f) => f.grade === 'NOTE' && f.gate === '27'));
  assert.equal(r.code, 1);
});

test('waiver reason must relate to the page', () => {
  const design = PLAIN_DESIGN + '\n## Anti-slop Waivers\n\n- waive 1 · --font-display · quarterly velocity metrics demand neutrality everywhere\n';
  withProject({ 'DESIGN.md': design, 'index.html': page({ tokens: '--font-display: "Inter", sans-serif;' }) }, (dir) => {
    const r = check(dir);
    assert.ok(hits(r, '1', ['REFLEX']).length > 0, r.output);
    assert.ok(r.findings.some((f) => f.grade === 'NOTE' && /shares no word/.test(f.message)), r.output);
  });
});

test('scope component skips page-only and absence gates', () => {
  withProject({ 'Card.html': page({ body: '<section><p class="eyebrow">Features</p><h2>Tide tables</h2></section><button>Go</button>', clip: false }) }, (dir) => {
    const r = check(dir, ['--scope', 'component']);
    for (const g of ['54', '34', '26a', '26b']) assert.equal(hits(r, g).length, 0, `${g} under component scope:\n${r.output}`);
  });
});

test('--design overrides the walk-up and --json emits parseable output', () => {
  withProject({ 'index.html': page({ tokens: '--font-display: "Inter", sans-serif;' }) }, (dir) => {
    const r = run([dir, '--design', join(FIX, 'inter-declared', 'DESIGN.md'), '--json'], { cwd: dir });
    const j = JSON.parse(r.output);
    assert.ok(j.summary && Array.isArray(j.findings));
    assert.ok(j.findings.filter((f) => f.gate === '1').every((f) => f.grade === 'WAIVED'));
  });
});

test('directory walk skips node_modules, dist and dot directories', () => {
  const bad = page({ css: '.x { color: #336699; }' });
  withProject({ 'index.html': page(), 'node_modules/x/index.html': bad, 'dist/index.html': bad, '.cache/index.html': bad }, (dir) => {
    const r = check(dir);
    assert.equal(r.summary.files, 1);
    assert.equal(hits(r, '48').length, 0, r.output);
  });
});

test('text output: one line per finding plus a summary line', () => {
  const r = check(join(FIX, 'waive-floor'));
  const lines = r.output.split('\n');
  assert.match(lines[0], /^FAIL 27 \S+:\d+ .+ → .+$/);
  assert.match(lines[lines.length - 1], /^slop_check: Floor 1 FAIL/);
});

test('exit codes over the CLI: 0 clean, 1 open findings, 2 bad arguments', () => {
  const cli = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  assert.equal(cli(join(FIX, 'eyebrow-pass')).status, 0);
  assert.equal(cli(join(FIX, 'slopped')).status, 1);
  assert.equal(cli().status, 2);
  assert.equal(cli(join(FIX, 'slopped'), '--scope', 'site').status, 2);
  assert.equal(cli(join(FIX, 'does-not-exist')).status, 2);
  assert.equal(cli(join(FIX, 'slopped'), '--bogus').status, 2);
  assert.equal(cli(join(FIX, 'slopped'), '--design', join(FIX, 'nope.md')).status, 2);
});

test('the script terminates on its own skill directory', () => {
  const r = spawnSync(process.execPath, [SCRIPT, SKILL], { encoding: 'utf8', timeout: 60000 });
  assert.ok(r.status === 0 || r.status === 1, r.stderr);
  assert.match(r.stdout, /slop_check: Floor/);
});

test('YAML reader handles block maps, flow maps and quoted scalars', () => {
  const y = parseYaml('name: "A: b"\nx-theme:\n  display: {class: mono, face: "JetBrains Mono"}\n  list:\n    - one\n    - two\ncolors:\n  ink: \'#111\'\n');
  assert.equal(y.name, 'A: b');
  assert.equal(y['x-theme'].display.class, 'mono');
  assert.equal(y['x-theme'].display.face, 'JetBrains Mono');
  assert.deepEqual(y['x-theme'].list, ['one', 'two']);
  assert.equal(y.colors.ink, '#111');
});
