#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const DEFAULT_LOG_DIR = 'tmp/zephyr';

function printUsage() {
  process.stderr.write(
    'Usage:\n' +
      '  node zephyr-scripts/run-with-log.js [--log-path <path>] -- <command> [args...]\n' +
      '  node zephyr-scripts/run-with-log.js [--log-path <path>] --shell "<command>"\n'
  );
}

function readActionType(commandArgs) {
  const actionTypeArg = commandArgs.find(arg => arg.startsWith('--action-type='));
  return actionTypeArg?.split('=')[1]?.trim().toLowerCase();
}

function defaultLogPath(commandArgs) {
  const actionType = readActionType(commandArgs);
  if (actionType) {
    return path.join(DEFAULT_LOG_DIR, `${actionType.replace(/_/g, '-')}.log`);
  }

  return path.join(DEFAULT_LOG_DIR, 'run.log');
}

const args = process.argv.slice(2);

let logPath = null;
let shellCommand = null;
let commandArgs = [];

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];

  if (arg === '--log-path') {
    logPath = args[i + 1] ?? null;
    i += 1;
    continue;
  }

  if (arg === '--shell') {
    shellCommand = args[i + 1] ?? null;
    i += 1;
    continue;
  }

  if (arg === '--') {
    commandArgs = args.slice(i + 1);
    break;
  }
}

if (!shellCommand && commandArgs.length === 0) {
  printUsage();
  process.exit(1);
}

const resolvedLogPath = path.resolve(process.cwd(), logPath ?? defaultLogPath(commandArgs));
fs.mkdirSync(path.dirname(resolvedLogPath), { recursive: true });

const logStream = fs.createWriteStream(resolvedLogPath, { flags: 'w' });

function writeToLog(chunk) {
  if (!logStream.destroyed) {
    logStream.write(chunk);
  }
}

function writeErrorAndExit(message, code) {
  process.stderr.write(message);
  writeToLog(message);
  logStream.end(() => process.exit(code));
}

const child = shellCommand
  ? spawn(shellCommand, {
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe'],
    })
  : spawn(commandArgs[0], commandArgs.slice(1), {
      stdio: ['inherit', 'pipe', 'pipe'],
    });

child.stdout.on('data', chunk => {
  process.stdout.write(chunk);
  writeToLog(chunk);
});

child.stderr.on('data', chunk => {
  process.stderr.write(chunk);
  writeToLog(chunk);
});

child.on('error', error => {
  writeErrorAndExit(`${String(error)}\n`, 1);
});

child.on('close', (code, signal) => {
  logStream.end(() => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });
});
