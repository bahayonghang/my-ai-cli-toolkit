import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { EventEmitter, once } from 'node:events';
import { existsSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import { test } from 'node:test';
import {
  CdpPipe,
  createNulDecoder,
  findBrowser,
  startStaticServer,
  stopBrowser,
} from '../scripts/validate_demo.mjs';
import { config as artmuse } from '../demo/artmuse-ios/validate.mjs';
import { config as marble } from '../demo/marble-note/validate.mjs';

const root = path.resolve('skills/developer-tools-integrations/image-to-ui-skill');

test('NUL decoder handles split and combined frames', () => {
  const messages = [];
  const decode = createNulDecoder((message) => messages.push(message));
  decode(Buffer.from('{"id":1'));
  decode(Buffer.from('}\0{"id":2}\0'));
  assert.deepEqual(messages, [{ id: 1 }, { id: 2 }]);
});

test('CDP pipe routes session requests and errors', async () => {
  const input = new PassThrough();
  const output = new PassThrough();
  const processStub = new EventEmitter();
  const cdp = new CdpPipe(input, output, processStub, 100);
  const sent = once(input, 'data');
  const pending = cdp.send('Runtime.evaluate', { expression: '1+1' }, 'session-1');
  const [frame] = await sent;
  const message = JSON.parse(frame.subarray(0, frame.length - 1).toString());
  assert.equal(message.sessionId, 'session-1');
  output.write(`${JSON.stringify({ id: message.id, result: { value: 2 } })}\0`);
  assert.deepEqual(await pending, { value: 2 });

  const errorSent = once(input, 'data');
  const rejected = cdp.send('Page.fail');
  const [errorFrame] = await errorSent;
  const errorMessage = JSON.parse(errorFrame.subarray(0, errorFrame.length - 1).toString());
  output.write(`${JSON.stringify({ id: errorMessage.id, error: { code: -1, message: 'bad' } })}\0`);
  await assert.rejects(rejected, /CDP -1: bad/);
});

test('CDP pipe times out pending requests', async () => {
  const cdp = new CdpPipe(new PassThrough(), new PassThrough(), new EventEmitter(), 10);
  await assert.rejects(cdp.send('Runtime.never'), /CDP timeout/);
});

test('CDP pipe rejects pending requests when browser spawn fails', async () => {
  const browser = new EventEmitter();
  const cdp = new CdpPipe(new PassThrough(), new PassThrough(), browser, 100);
  const pending = cdp.send('Target.createTarget');
  browser.emit('error', new Error('spawn denied'));
  await assert.rejects(pending, /spawn denied/);
});

test('browser shutdown escalates and waits for forced exit', async () => {
  const browser = new EventEmitter();
  browser.exitCode = null;
  browser.signalCode = null;
  const signals = [];
  browser.kill = (signal = 'SIGTERM') => {
    signals.push(signal);
    if (signal === 'SIGKILL') {
      queueMicrotask(() => {
        browser.signalCode = signal;
        browser.emit('exit', null, signal);
      });
    }
    return true;
  };

  await stopBrowser(browser, 1);

  assert.deepEqual(signals, ['SIGTERM', 'SIGKILL']);
  assert.equal(browser.signalCode, 'SIGKILL');
});

test('browser discovery covers explicit, Windows, macOS, and Linux paths', () => {
  assert.deepEqual(
    findBrowser({ env: { CHROME_PATH: 'missing' }, exists: () => false }),
    { ok: false, code: 2, reason: 'CHROME_PATH does not exist: missing' },
  );
  const windows = findBrowser({
    platform: 'win32', env: { ProgramFiles: 'C:\\PF' },
    exists: (candidate) => candidate.endsWith('chrome.exe'), which: () => undefined,
  });
  assert.equal(windows.ok, true);
  assert.match(windows.path, /chrome\.exe$/);
  const mac = findBrowser({
    platform: 'darwin', env: {},
    exists: (candidate) => candidate.includes('Chromium.app'), which: () => undefined,
  });
  assert.match(mac.path, /Chromium\.app/);
  const linux = findBrowser({
    platform: 'linux', env: {}, exists: (candidate) => candidate === '/usr/bin/chromium',
    which: (command) => command === 'chromium' ? '/usr/bin/chromium' : undefined,
  });
  assert.equal(linux.path, '/usr/bin/chromium');
});

function rawGet(url, requestPath) {
  const parsed = new URL(url);
  return new Promise((resolve, reject) => {
    const req = request({ host: parsed.hostname, port: parsed.port, path: requestPath }, (response) => {
      response.resume();
      response.on('end', () => resolve({ status: response.statusCode, type: response.headers['content-type'] }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('static server handles MIME, missing files, and traversal', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'image2-static-'));
  writeFileSync(path.join(dir, 'index.html'), '<!doctype html>', 'utf8');
  writeFileSync(path.join(dir, 'app.css'), 'body{}', 'utf8');
  const server = await startStaticServer(dir);
  try {
    assert.deepEqual(await rawGet(server.url, '/'), { status: 200, type: 'text/html; charset=utf-8' });
    assert.deepEqual(await rawGet(server.url, '/app.css'), { status: 200, type: 'text/css; charset=utf-8' });
    assert.equal((await rawGet(server.url, '/missing')).status, 404);
    assert.equal((await rawGet(server.url, '/../secret')).status, 403);
    assert.equal((await rawGet(server.url, '/%2e%2e/secret')).status, 403);
  } finally {
    await server.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test('demo configs preserve the legacy assertion counts', () => {
  assert.equal(artmuse.steps.length, 4);
  assert.equal(artmuse.htmlMustMatch.length, 3);
  assert.equal(marble.steps.length, 12);
  assert.ok(marble.htmlMustMatch.length >= 7);
});

for (const name of ['artmuse-ios', 'marble-note']) {
  test(`browser smoke: ${name}`, { skip: process.env.IMAGE2_SKILL_BROWSER_TESTS !== '1' }, () => {
    const entry = path.join(root, 'demo', name, 'validate.mjs');
    const result = spawnSync(process.execPath, [entry], { encoding: 'utf8', env: process.env, timeout: 60_000 });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const lines = result.stdout.trim().split(/\r?\n/);
    const payload = JSON.parse(lines.at(-1));
    assert.equal(payload.ok, true);
    assert.equal(payload.name, name);
    assert.equal(payload.screenshots.length, 2);
    for (const screenshot of payload.screenshots) {
      assert.ok(existsSync(screenshot), screenshot);
      assert.ok(statSync(screenshot).size > 10_000, screenshot);
    }
  });
}
