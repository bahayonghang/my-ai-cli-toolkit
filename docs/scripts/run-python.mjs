#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import path from 'node:path'

function candidates() {
  if (process.platform === 'win32') {
    return [
      ['py', ['-3']],
      ['python3', []],
      ['python', []],
    ]
  }

  return [
    ['python3', []],
    ['python', []],
  ]
}

const [scriptArg, ...scriptArgs] = process.argv.slice(2)

if (!scriptArg) {
  console.error('Usage: run-python.mjs <script.py> [args...]')
  process.exit(1)
}

const scriptPath = path.resolve(process.cwd(), scriptArg)

for (const [command, prefixArgs] of candidates()) {
  const result = spawnSync(command, [...prefixArgs, scriptPath, ...scriptArgs], {
    stdio: 'inherit',
  })

  if (result.error?.code === 'ENOENT') {
    continue
  }

  if (result.error) {
    throw result.error
  }

  process.exit(result.status ?? 0)
}

const tried = candidates()
  .map(([command, args]) => [command, ...args].join(' '))
  .join(', ')

console.error(`Unable to find a usable Python interpreter. Tried: ${tried}`)
process.exit(1)
