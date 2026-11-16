// Deterministic Git command probes, not provider/model behavior evaluation.
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'git-commit-preparation-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(tmpdir()));
    assert.ok(path.basename(root).startsWith('git-commit-preparation-'));
    rmSync(root, { recursive: true, force: true });
  });
  const git = (...args) => {
    const result = spawnSync('git', ['--no-optional-locks', ...args], {
      cwd: root, encoding: 'utf8',
      env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: path.join(root, 'absent-global-config') },
    });
    assert.ifError(result.error);
    return result;
  };
  const ok = (...args) => {
    const result = git(...args);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };
  ok('init', '-q');
  ok('config', 'user.name', 'Fixture');
  ok('config', 'user.email', 'fixture@example.invalid');
  ok('config', 'core.autocrlf', 'false');
  const write = (name, text) => writeFileSync(path.join(root, name), text, 'utf8');
  write('README.md', 'Original text\n');
  ok('add', 'README.md');
  ok('commit', '-qm', 'docs: initial fixture');
  const snapshot = () => ({
    head: ok('rev-parse', 'HEAD').trim(),
    index: createHash('sha256').update(readFileSync(path.join(root, '.git/index'))).digest('hex'),
    readme: readFileSync(path.join(root, 'README.md'), 'utf8'),
  });
  return { root, git, ok, write, snapshot };
}

test('empty staged set: candidate inspection preserves index bytes, files and HEAD', t => {
  const f = fixture(t);
  f.ok('config', 'status.showUntrackedFiles', 'no');
  f.write('README.md', 'Corrected text\n');
  f.write('setup.md', 'Setup guide\n');
  const before = f.snapshot();
  const status = f.ok('status', '--short', '--untracked-files=all');
  assert.match(status, / M README.md/);
  assert.match(status, /\?\? setup.md/);
  assert.equal(f.ok('diff', '--staged'), '');
  assert.match(f.ok('diff'), /Corrected text/);
  assert.equal(readFileSync(path.join(f.root, 'setup.md'), 'utf8'), 'Setup guide\n');
  assert.deepEqual(f.snapshot(), before);
});

test('clean repository inspection has no candidates or state changes', t => {
  const f = fixture(t);
  const before = f.snapshot();
  assert.equal(f.ok('status', '--short', '--untracked-files=all'), '');
  assert.equal(f.ok('diff', '--staged'), '');
  assert.deepEqual(f.snapshot(), before);
});

test('message hook rejection preserves HEAD; corrected authorized retry still runs hook', t => {
  const f = fixture(t);
  const hook = path.join(f.root, '.git/hooks/commit-msg');
  writeFileSync(hook, '#!/bin/sh\nprintf "invoked\\n" >> .git/hook-runs\nif ! head -n 1 "$1" | grep -q "^docs:"; then\n  echo "subject must start with docs: [fixture-type]" >&2\n  exit 1\nfi\n');
  chmodSync(hook, 0o755);
  f.write('README.md', 'Corrected text\n');
  f.ok('add', 'README.md');
  f.write('.git/fixture-message', 'bad message\n');
  const before = f.snapshot();
  const stagedBefore = f.ok('ls-files', '--stage');
  const rejected = f.git('commit', '-F', '.git/fixture-message');
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /subject must start with docs: \[fixture-type\]/);
  assert.equal(f.snapshot().head, before.head);
  assert.equal(f.snapshot().readme, before.readme);
  assert.equal(f.ok('ls-files', '--stage'), stagedBefore);
  // Explicit test scenario grants correction authority; this does not infer it.
  f.write('.git/fixture-message', 'docs: correct text\n');
  f.ok('commit', '-F', '.git/fixture-message');
  assert.notEqual(f.snapshot().head, before.head);
  assert.equal(readFileSync(path.join(f.root, '.git/hook-runs'), 'utf8'), 'invoked\ninvoked\n');
  assert.equal(f.ok('show', 'HEAD:README.md'), 'Corrected text\n');
});

test('formatter failure exposes partial staging and extra paths without re-staging them', t => {
  const f = fixture(t);
  f.write('README.md', 'Authorized change\n');
  f.ok('add', 'README.md');
  f.write('README.md', 'Authorized change\nUnstaged experiment\n');
  mkdirSync(path.join(f.root, 'src'));
  f.write('src/experimental.ts', 'user experiment\n');
  const hook = path.join(f.root, '.git/hooks/pre-commit');
  writeFileSync(hook, '#!/bin/sh\nprintf "formatter edit\\n" >> README.md\nprintf "formatter edit\\n" >> src/experimental.ts\nprintf "report\\n" > formatter-report.txt\necho "formatter changed files [fixture]" >&2\nexit 1\n');
  chmodSync(hook, 0o755);
  const before = f.snapshot();
  const stagedBefore = f.ok('ls-files', '--stage');
  const rejected = f.git('commit', '-m', 'docs: authorized change');
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /formatter changed files/);
  const status = f.ok('status', '--short', '--untracked-files=all');
  assert.match(status, /MM README.md/);
  assert.match(status, /\?\? formatter-report.txt/);
  assert.match(status, /\?\? src\/experimental.ts/);
  assert.equal(f.ok('show', ':README.md'), 'Authorized change\n');
  assert.match(f.ok('diff'), /Unstaged experiment/);
  assert.equal(f.snapshot().head, before.head);
  assert.equal(f.ok('ls-files', '--stage'), stagedBefore);
  assert.equal(readFileSync(path.join(f.root, 'README.md'), 'utf8'), 'Authorized change\nUnstaged experiment\nformatter edit\n');
  assert.equal(readFileSync(path.join(f.root, 'src/experimental.ts'), 'utf8'), 'user experiment\nformatter edit\n');
});
