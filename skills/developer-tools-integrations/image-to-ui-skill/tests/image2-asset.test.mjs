import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const skillRoot = path.resolve('skills/developer-tools-integrations/image-to-ui-skill');
const wrapper = path.join(skillRoot, 'scripts', 'image2_asset.py');

function resolvePython() {
  const env = { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' };
  const requested = process.env.PYTHON;
  const candidates = requested
    ? [[requested, []]]
    : process.platform === 'win32'
      ? [['python', []], ['py', ['-3']]]
      : [['python', []]];
  for (const [command, prefix] of candidates) {
    const result = spawnSync(
      command,
      [...prefix, '-c', 'import sys; print(sys.executable)'],
      { encoding: 'utf8', env },
    );
    if (result.status === 0) {
      return result.stdout.trim();
    }
  }
  throw new Error('Python interpreter not found (tried python and Windows py -3 fallback)');
}

const pythonExecutable = resolvePython();

function cleanEnv(overrides = {}) {
  const env = {
    ...process.env,
    PYTHONUTF8: '1',
    PYTHONIOENCODING: 'utf-8',
  };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) {
      delete env[key];
    } else {
      env[key] = value;
    }
  }
  return env;
}

function runPython(args, env) {
  return spawnSync(pythonExecutable, args, { encoding: 'utf8', env });
}

function runWrapper(args, overrides = {}) {
  return runPython([wrapper, ...args], cleanEnv(overrides));
}

function shellWord(value) {
  return `"${value.replaceAll('\\', '/').replaceAll('"', '\\"')}"`;
}

function makeArgvProbe(dir) {
  const probe = path.join(dir, 'capture argv.mjs');
  writeFileSync(
    probe,
    "import { writeFileSync } from 'node:fs';\nwriteFileSync(process.argv[2], JSON.stringify(process.argv.slice(3)), 'utf8');\n",
    'utf8',
  );
  return probe;
}

test('full IMAGE2_COMMAND template preserves injected argv values', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'image2-wrapper-template-'));
  try {
    const probe = makeArgvProbe(dir);
    const capture = path.join(dir, 'captured argv.json');
    const output = path.join(dir, 'output folder', 'out\\x.png');
    const template = [
      shellWord(process.execPath),
      shellWord(probe),
      shellWord(capture),
      '--prompt',
      '{prompt}',
      '--out',
      '{output}',
      '--size',
      '{size}',
      '--quality',
      '{quality}',
      '--format',
      '{output_format}',
    ].join(' ');

    const result = runWrapper(
      [
        'generate',
        '--prompt',
        'hello world two words',
        '--output',
        output,
        '--size',
        '1536x1024',
        '--quality',
        'high',
        '--output-format',
        'webp',
        '--prefer',
        'image2',
      ],
      { IMAGE2_COMMAND: template },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(readFileSync(capture, 'utf8')), [
      '--prompt',
      'hello world two words',
      '--out',
      output,
      '--size',
      '1536x1024',
      '--quality',
      'high',
      '--format',
      'webp',
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('single supported optional placeholder makes a complete template', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'image2-wrapper-quality-'));
  try {
    const probe = makeArgvProbe(dir);
    const qualityCapture = path.join(dir, 'quality.json');
    const qualityTemplate = `${shellWord(process.execPath)} ${shellWord(probe)} ${shellWord(qualityCapture)} --quality {quality}`;
    const quality = runWrapper(
      ['generate', '--prompt', 'test', '--output', path.join(dir, 'out.png'), '--quality', 'low'],
      { IMAGE2_COMMAND: qualityTemplate },
    );
    const formatCapture = path.join(dir, 'format.json');
    const formatTemplate = `${shellWord(process.execPath)} ${shellWord(probe)} ${shellWord(formatCapture)} --format {output_format}`;
    const format = runWrapper(
      ['generate', '--prompt', 'test', '--output', path.join(dir, 'out.webp'), '--output-format', 'webp'],
      { IMAGE2_COMMAND: formatTemplate },
    );

    assert.equal(quality.status, 0, quality.stderr);
    assert.equal(format.status, 0, format.stderr);
    assert.deepEqual(JSON.parse(readFileSync(qualityCapture, 'utf8')), ['--quality', 'low']);
    assert.deepEqual(JSON.parse(readFileSync(formatCapture, 'utf8')), ['--format', 'webp']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('configured command without placeholders receives the standard arguments', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'image2-wrapper-base-'));
  try {
    const probe = makeArgvProbe(dir);
    const capture = path.join(dir, 'captured.json');
    const template = `${shellWord(process.execPath)} ${shellWord(probe)} ${shellWord(capture)}`;
    const output = path.join(dir, 'out.png');
    const result = runWrapper(
      ['generate', '--prompt', 'base command', '--output', output, '--prefer', 'image2'],
      { IMAGE2_COMMAND: template },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(readFileSync(capture, 'utf8')), [
      'generate',
      '--prompt',
      'base command',
      '--output',
      output,
      '--size',
      '1024x1024',
      '--quality',
      'medium',
      '--output-format',
      'png',
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('unknown IMAGE2_COMMAND placeholder fails without a traceback', () => {
  const result = runWrapper(
    ['generate', '--prompt', 'test', '--output', 'out.png', '--dry-run'],
    { IMAGE2_COMMAND: 'mytool --unknown {missing}' },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unsupported IMAGE2_COMMAND placeholder\(s\): missing/);
  assert.doesNotMatch(result.stderr, /Traceback/);
});

test('fallback dry-run reports every missing prerequisite without filesystem writes', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'image2-wrapper-dry-run-'));
  try {
    const output = path.join(dir, 'does-not-exist', 'nested', 'out.png');
    const missingCli = path.join(dir, 'missing fallback.py');
    const result = runWrapper(
      ['generate', '--prompt', 'test', '--output', output, '--prefer', 'fallback', '--dry-run'],
      {
        IMAGE2_COMMAND: null,
        OPENROUTER_ICU_IMAGE_CLI: missingCli,
        OPENROUTER_ICU_API_KEY: null,
        OPENAI_API_KEY: null,
      },
    );
    const combined = `${result.stdout}\n${result.stderr}`;

    assert.equal(result.status, 0, combined);
    assert.match(combined, /fallback not ready/);
    assert.match(combined, /fallback CLI not found/);
    assert.match(combined, /API_KEY is required/);
    assert.match(result.stdout, /planned-channel=openrouter-icu-gpt-image-2/);
    assert.doesNotMatch(result.stdout, /\] channel=openrouter-icu-gpt-image-2/);
    assert.equal(existsSync(path.dirname(output)), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('native dry-run is side-effect free and reports a planned channel', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'image2-wrapper-native-dry-'));
  try {
    const output = path.join(dir, 'does-not-exist', 'out.png');
    const result = runWrapper(
      ['generate', '--prompt', 'hello world', '--output', output, '--prefer', 'image2', '--dry-run'],
      { IMAGE2_COMMAND: 'mytool --prompt {prompt} --out {output}' },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /planned-channel=native-image2/);
    assert.doesNotMatch(result.stdout, /\] channel=native-image2/);
    assert.equal(existsSync(path.dirname(output)), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('missing native command and unusable real fallback keep distinct exit codes', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'image2-wrapper-exits-'));
  try {
    const common = {
      IMAGE2_COMMAND: null,
      PATH: '',
      OPENROUTER_ICU_IMAGE_CLI: path.join(dir, 'missing.py'),
      OPENROUTER_ICU_API_KEY: null,
      OPENAI_API_KEY: null,
    };
    const native = runWrapper(
      ['generate', '--prompt', 'test', '--output', path.join(dir, 'native.png'), '--prefer', 'image2'],
      common,
    );
    const fallback = runWrapper(
      ['generate', '--prompt', 'test', '--output', path.join(dir, 'fallback.png'), '--prefer', 'fallback'],
      common,
    );

    assert.equal(native.status, 2, native.stderr);
    assert.equal(fallback.status, 3, fallback.stderr);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('SKILL.md invokes the wrapper through the literal skill directory', () => {
  const skill = readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const invocations = skill
    .split(/\r?\n/)
    .filter((line) => /^python .*image2_asset\.py/.test(line));

  assert.equal(invocations.length, 4);
  for (const invocation of invocations) {
    assert.match(invocation, /^python "<skill-dir>\/scripts\/image2_asset\.py"/);
  }
  assert.doesNotMatch(skill, /python scripts[\\/]image2_asset\.py/);
  assert.match(skill, /py -3/);
});
