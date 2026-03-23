#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const stageDir = path.resolve(
  process.env.CDP_UPLOAD_STAGE_DIR || path.join(os.tmpdir(), 'web-access-upload-staging')
);

function usage() {
  console.error('Usage: node stage-upload.mjs <file> [more-files...]');
  process.exit(1);
}

function nextAvailablePath(dir, baseName) {
  const parsed = path.parse(baseName);
  let candidate = path.join(dir, baseName);
  let counter = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${parsed.name}-${counter}${parsed.ext}`);
    counter += 1;
  }
  return candidate;
}

const inputs = process.argv.slice(2);
if (inputs.length === 0) usage();

try {
  fs.mkdirSync(stageDir, { recursive: true });
  const stageDirReal = fs.realpathSync(stageDir);

  const staged = inputs.map((input) => {
    const source = fs.realpathSync(input);
    const stat = fs.statSync(source);
    if (!stat.isFile()) {
      throw new Error(`Not a regular file: ${input}`);
    }

    const destination = nextAvailablePath(stageDirReal, path.basename(source));
    fs.copyFileSync(source, destination);

    return {
      source,
      staged: destination,
    };
  });

  console.log(JSON.stringify({ stageDir: stageDirReal, files: staged }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
