#!/usr/bin/env node
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { runZephyr } from '@hmcts/zephyr-automation-nodejs';

import { mergeCreatedCycleIntoTargetCycle } from './zephyr-cycle-folder';
import { createZephyrOptions } from './zephyr-util';

const MIN_JAVA_MAJOR_VERSION = 21;
const JAR_PATH = path.resolve(process.cwd(), 'lib/uk.gov.hmcts-zephyr-automation-independent.jar');
const FETCH_JAR_SCRIPT = path.resolve(process.cwd(), 'zephyr-scripts/fetch-zephyr-jar.sh');

function ensureZephyrJar(): void {
  if (fs.existsSync(JAR_PATH)) {
    return;
  }

  console.log(`Zephyr jar not found at ${JAR_PATH}; fetching via fetch-zephyr-jar.sh`);
  execSync(`bash "${FETCH_JAR_SCRIPT}"`, { stdio: 'inherit' });
}

function assertJavaVersion(): void {
  try {
    const output = execSync('java -version 2>&1', { encoding: 'utf8' });
    const versionLine = output.split('\n').find(line => line.includes('version')) ?? '';
    const match = versionLine.match(/version "(\d+)/);

    if (!match) {
      throw new Error('Could not determine Java version from `java -version` output.');
    }

    const majorVersion = Number(match[1]);
    if (majorVersion < MIN_JAVA_MAJOR_VERSION) {
      throw new Error(
        `Java ${MIN_JAVA_MAJOR_VERSION}+ is required to run the Zephyr automation jar, but Java ${majorVersion} was found.\n` +
          'Install Java 21 and point JAVA_HOME at it before retrying, e.g.\n' +
          '  brew install openjdk@21\n' +
          '  export JAVA_HOME=$(/usr/libexec/java_home -v 21)\n' +
          '  export PATH="$JAVA_HOME/bin:$PATH"'
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Java 21+ is required')) {
      throw error;
    }

    throw new Error(
      'Java is required to run Zephyr upload scripts. Install Java 21 and ensure `java` is on your PATH.',
      { cause: error }
    );
  }
}

const DEFAULT_ACTION_TYPE = 'CREATE_EXECUTION';
const DEFAULT_PROCESS_TYPE = 'CUCUMBER_JSON_REPORT';
const DEFAULT_REPORT_PATH = 'functional-output/zephyr/cucumber-report.json';

function getArg(name: string, defaultValue?: string): string {
  const arg = process.argv.slice(2).find(a => a.startsWith(`--${name}=`));

  if (arg) {
    return arg.split('=')[1];
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(`Missing required argument --${name}`);
}

function buildDefaultCycleName(): string {
  const now = new Date();
  const pad = (value: number): string => String(value).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return `pt-frontend functional ${date} ${time}`;
}

const actionType = getArg('action-type', DEFAULT_ACTION_TYPE);
const processType = getArg('process-type', DEFAULT_PROCESS_TYPE);
const reportPath = path.resolve(process.cwd(), getArg('report-path', DEFAULT_REPORT_PATH));
const isCreateExecution = actionType === 'CREATE_EXECUTION';
const envCycleName = process.env['EXECUTION_TEST_CYCLE_NAME']?.trim();
const cycleName = envCycleName || (isCreateExecution ? buildDefaultCycleName() : undefined);

console.log(`Running Zephyr with actionType=${actionType}, processType=${processType}, reportPath=${reportPath}`);
ensureZephyrJar();
assertJavaVersion();
const zephyrOptions = createZephyrOptions(actionType, processType, reportPath);
console.log(`Using Jira project id ${zephyrOptions.jiraProjectId}`);
if (cycleName) {
  if (envCycleName) {
    console.log(
      `Using EXECUTION_TEST_CYCLE_NAME override "${cycleName}". Unset this env var to use the default timestamped name.`
    );
  } else {
    console.log(`Using test cycle name "${cycleName}"`);
  }
}
zephyrOptions.executionEnvironment = process.env['EXECUTION_ENVIRONMENT'] ?? undefined;
zephyrOptions.executionBuild = process.env['EXECUTION_BUILD'] ?? undefined;
zephyrOptions.executionTestCycleName = cycleName;
zephyrOptions.executionTestCycleDescription = process.env['EXECUTION_TEST_CYCLE_DESCRIPTION'] ?? undefined;
zephyrOptions.executionTestCycleVersion = process.env['EXECUTION_TEST_CYCLE_VERSION'] ?? undefined;
zephyrOptions.executionAttachEvidence = true;

const exitCode = runZephyr(zephyrOptions);

if (exitCode !== 0) {
  process.exit(exitCode);
}

if (isCreateExecution && cycleName) {
  mergeCreatedCycleIntoTargetCycle(cycleName)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
} else {
  process.exit(0);
}
