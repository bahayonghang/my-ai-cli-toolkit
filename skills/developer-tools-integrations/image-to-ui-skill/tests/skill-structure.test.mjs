import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const root = path.resolve('skills/developer-tools-integrations/image-to-ui-skill');

function walkFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

test('required skill files and demo entrypoints exist', () => {
  const required = [
    'SKILL.md', 'README.md', 'agents/interface.yaml', 'scripts/image2_asset.py',
    'scripts/validate_demo.mjs', 'evals/evals.json',
    'demo/artmuse-ios/index.html', 'demo/artmuse-ios/styles.css',
    'demo/artmuse-ios/script.js', 'demo/artmuse-ios/README.md', 'demo/artmuse-ios/validate.mjs',
    'demo/marble-note/index.html', 'demo/marble-note/styles.css',
    'demo/marble-note/script.js', 'demo/marble-note/README.md', 'demo/marble-note/validate.mjs',
  ];
  for (const relative of required) assert.ok(existsSync(path.join(root, relative)), relative);
  assert.equal(walkFiles(root).some((name) => name.endsWith('.ps1')), false);
  for (const relative of ['README.md', 'demo/artmuse-ios/README.md', 'demo/marble-note/README.md', 'demo/marble-note/image2-asset-plan.md']) {
    assert.doesNotMatch(readFileSync(path.join(root, relative), 'utf8'), /validate\.ps1/);
  }
});

test('SKILL.md reference index covers every reference document', () => {
  const skill = readFileSync(path.join(root, 'SKILL.md'), 'utf8');
  const references = readdirSync(path.join(root, 'references'))
    .filter((name) => name.endsWith('.md')).sort();
  const indexed = [...skill.matchAll(/`references\/([^`]+\.md)`/g)]
    .map((match) => match[1]).filter((name, index, all) => all.indexOf(name) === index).sort();
  assert.deepEqual(indexed, references);
});

test('README local links resolve', () => {
  const readme = readFileSync(path.join(root, 'README.md'), 'utf8');
  const targets = [
    ...readme.matchAll(/!?(?:\[[^\]]*\])\(([^)]+)\)/g),
    ...readme.matchAll(/<(?:img|a)\s+[^>]*(?:src|href)="([^"]+)"/g),
  ].map((match) => match[1]);
  for (const target of targets) {
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    const clean = decodeURIComponent(target.split('#')[0]);
    assert.ok(existsSync(path.resolve(root, clean)), `Missing README target: ${target}`);
  }
});

test('interface and eval contracts are structurally complete', () => {
  const interfaceYaml = readFileSync(path.join(root, 'agents', 'interface.yaml'), 'utf8');
  for (const field of ['display_name:', 'short_description:', 'default_prompt:']) {
    assert.match(interfaceYaml, new RegExp(field));
  }
  const evals = JSON.parse(readFileSync(path.join(root, 'evals', 'evals.json'), 'utf8'));
  assert.equal(evals.skill_name, 'image-to-ui-skill');
  assert.equal(evals.evals.length, 12);
  for (const entry of evals.evals) assert.ok(entry.assertions.length >= 2, `eval ${entry.id}`);
});
