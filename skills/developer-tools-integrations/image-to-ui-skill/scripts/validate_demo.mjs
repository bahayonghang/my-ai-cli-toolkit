import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdtempSync } from 'node:fs';

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.mjs', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.png', 'image/png'], ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'], ['.gif', 'image/gif'], ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'], ['.json', 'application/json; charset=utf-8'],
]);

export class DemoValidationError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

export function isMain(metaUrl) {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(metaUrl);
}

export function createNulDecoder(onMessage) {
  let pending = Buffer.alloc(0);
  return (chunk) => {
    pending = Buffer.concat([pending, chunk]);
    let boundary;
    while ((boundary = pending.indexOf(0)) !== -1) {
      const frame = pending.subarray(0, boundary);
      pending = pending.subarray(boundary + 1);
      if (frame.length) onMessage(JSON.parse(frame.toString('utf8')));
    }
  };
}

export class CdpPipe {
  constructor(input, output, browserProcess, timeoutMs = 10_000) {
    this.input = input;
    this.output = output;
    this.browserProcess = browserProcess;
    this.timeoutMs = timeoutMs;
    this.nextId = 1;
    this.pending = new Map();
    output.on('data', createNulDecoder((message) => this.#handle(message)));
    output.on('error', (error) => this.#rejectAll(error));
    output.on('close', () => this.#rejectAll(new Error('Chrome CDP output pipe closed')));
    browserProcess?.on('error', (error) => this.#rejectAll(error));
    browserProcess?.on('exit', (code) => this.#rejectAll(new Error(`Chrome exited with code ${code}`)));
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    const message = { id, method, params };
    if (sessionId) message.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, this.timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.input.write(`${JSON.stringify(message)}\0`);
    });
  }

  #handle(message) {
    if (!message.id) return;
    const entry = this.pending.get(message.id);
    if (!entry) return;
    this.pending.delete(message.id);
    clearTimeout(entry.timer);
    if (message.error) {
      entry.reject(new Error(`CDP ${message.error.code}: ${message.error.message}`));
    } else {
      entry.resolve(message.result ?? {});
    }
  }

  #rejectAll(error) {
    for (const { reject, timer } of this.pending.values()) {
      clearTimeout(timer);
      reject(error);
    }
    this.pending.clear();
  }
}

function defaultWhich(command) {
  const lookup = process.platform === 'win32' ? ['where.exe', command] : ['which', command];
  const result = spawnSync(lookup[0], lookup.slice(1), { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.split(/\r?\n/).find(Boolean) : undefined;
}

export function findBrowser({
  platform = process.platform,
  env = process.env,
  exists = existsSync,
  which = defaultWhich,
} = {}) {
  if (env.CHROME_PATH !== undefined) {
    return exists(env.CHROME_PATH)
      ? { ok: true, path: env.CHROME_PATH, source: 'CHROME_PATH' }
      : { ok: false, code: 2, reason: `CHROME_PATH does not exist: ${env.CHROME_PATH}` };
  }

  const candidates = [];
  if (platform === 'win32') {
    for (const root of [env.ProgramFiles, env['ProgramFiles(x86)'], env.LocalAppData].filter(Boolean)) {
      candidates.push(path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'));
      candidates.push(path.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
    }
  } else if (platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    );
  } else {
    for (const command of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']) {
      const resolved = which(command);
      if (resolved) candidates.push(resolved);
    }
  }
  const found = candidates.find((candidate) => exists(candidate));
  return found
    ? { ok: true, path: found, source: 'auto' }
    : { ok: false, code: 2, reason: `No Chromium browser found for ${platform}` };
}

export async function startStaticServer(root) {
  const resolvedRoot = path.resolve(root);
  const server = createServer((request, response) => {
    const rawPath = (request.url ?? '/').split('?')[0];
    let decoded;
    try {
      decoded = decodeURIComponent(rawPath);
    } catch {
      response.writeHead(400).end('Bad URL encoding');
      return;
    }
    if (decoded.split('/').includes('..')) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const relativePath = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
    const target = path.resolve(resolvedRoot, relativePath);
    const relative = path.relative(resolvedRoot, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if (!existsSync(target) || !statSync(target).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'content-type': MIME.get(path.extname(target).toLowerCase()) ?? 'application/octet-stream' });
    response.end(readFileSync(target));
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}/`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

function assertStaticConfig(config, demoDir) {
  for (const file of config.staticFiles) {
    if (!existsSync(path.join(demoDir, file))) throw new DemoValidationError(`Missing ${file}`);
  }
  const html = readFileSync(path.join(demoDir, 'index.html'), 'utf8');
  for (const check of config.htmlMustMatch ?? []) {
    if (!check.pattern.test(html)) throw new DemoValidationError(check.message);
  }
  for (const check of config.htmlMustNotMatch ?? []) {
    if (check.pattern.test(html)) throw new DemoValidationError(check.message);
  }
}

function matchesExpectation(actual, expected) {
  if (!expected || typeof expected !== 'object') return Object.is(actual, expected);
  if (expected.op === '>=') return actual >= expected.value;
  if (expected.op === '>') return actual > expected.value;
  if (expected.op === '<=') return actual <= expected.value;
  if (expected.op === '<') return actual < expected.value;
  throw new Error(`Unknown expectation operator: ${expected.op}`);
}

async function evaluate(cdp, sessionId, expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
  if (result.exceptionDetails) throw new Error(`JavaScript evaluation failed: ${expression}`);
  return result.result?.value;
}

async function waitFor(cdp, sessionId, expression, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(cdp, sessionId, expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new DemoValidationError(`Demo did not become ready: ${expression}`, 4);
}

async function capture(cdp, sessionId, viewport, output) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1, mobile: viewport.width <= 500 }, sessionId);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false }, sessionId);
  writeFileSync(output, Buffer.from(data, 'base64'));
  if (statSync(output).size <= 10_000) throw new DemoValidationError(`Screenshot is too small: ${output}`);
}

export async function stopBrowser(child, timeoutMs = 2_000) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;

  const waitForExit = () => new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve(true);
      return;
    }
    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.off('exit', onExit);
      resolve(false);
    }, timeoutMs);
    child.once('exit', onExit);
  });

  let exited = waitForExit();
  child.kill();
  if (await exited) return;

  exited = waitForExit();
  child.kill('SIGKILL');
  if (!await exited) throw new Error('Browser did not exit after SIGKILL');
}

export async function runDemo(config, demoDir, options = {}) {
  assertStaticConfig(config, demoDir);
  const browser = findBrowser(options.browserOptions);
  if (!browser.ok) throw new DemoValidationError(browser.reason, browser.code);

  const server = await startStaticServer(demoDir);
  const profile = mkdtempSync(path.join(tmpdir(), `${config.name}-chrome-`));
  let child;
  try {
    child = spawn(browser.path, [
      '--headless=new', '--disable-gpu', '--disable-extensions', '--hide-scrollbars',
      '--no-first-run', '--no-default-browser-check', '--remote-debugging-pipe',
      `--user-data-dir=${profile}`, 'about:blank',
    ], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    const cdp = new CdpPipe(child.stdio[3], child.stdio[4], child);
    const { targetId } = await cdp.send('Target.createTarget', { url: server.url });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);
    await waitFor(cdp, sessionId, config.readyExpression);

    const screenshotsDir = path.join(demoDir, 'screenshots');
    const desktop = path.join(screenshotsDir, 'validate-desktop.png');
    const mobile = path.join(screenshotsDir, 'validate-mobile.png');
    await capture(cdp, sessionId, config.desktopViewport, desktop);

    const steps = [];
    for (const step of config.steps) {
      const actual = await evaluate(cdp, sessionId, step.expression);
      const pass = matchesExpectation(actual, step.expect);
      steps.push({ name: step.name, actual, pass });
      if (!pass) throw new DemoValidationError(`${step.name}: expected ${JSON.stringify(step.expect)}, got ${JSON.stringify(actual)}`);
    }
    await capture(cdp, sessionId, config.mobileViewport, mobile);
    const brokenImages = steps.find((step) => step.name === 'brokenImages')?.actual ?? 0;
    return { ok: true, name: config.name, url: server.url, screenshots: [desktop, mobile], steps, brokenImages };
  } catch (error) {
    if (error instanceof DemoValidationError) throw error;
    throw new DemoValidationError(`${error.message}${child?.exitCode ? `; browser=${child.exitCode}` : ''}`, 4);
  } finally {
    await stopBrowser(child);
    await server.close().catch(() => {});
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

export async function runDemoCli(config, demoDir) {
  try {
    const result = await runDemo(config, demoDir);
    console.log(JSON.stringify(result));
    return 0;
  } catch (error) {
    const code = error.exitCode ?? 4;
    console.error(`[validate-demo] ${error.message}`);
    console.log(JSON.stringify({ ok: false, name: config.name, error: error.message }));
    return code;
  }
}

async function main() {
  const argument = process.argv[2];
  if (!argument) throw new DemoValidationError('Usage: validate_demo.mjs <demo-dir>|--all', 1);
  const dirs = argument === '--all'
    ? ['artmuse-ios', 'marble-note'].map((name) => path.resolve(fileURLToPath(new URL('../demo', import.meta.url)), name))
    : [path.resolve(argument)];
  for (const dir of dirs) {
    const module = await import(pathToFileURL(path.join(dir, 'validate.mjs')));
    const code = await runDemoCli(module.config, dir);
    if (code) return code;
  }
  return 0;
}

if (isMain(import.meta.url)) {
  main().then((code) => { process.exitCode = code; }).catch((error) => {
    console.error(`[validate-demo] ${error.message}`);
    process.exitCode = error.exitCode ?? 4;
  });
}
