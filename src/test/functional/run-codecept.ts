#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const featuresDir = path.resolve(process.cwd(), 'src/test/functional/features');

/** Build feature file paths from E2E_SPEC (comma or semicolon keywords). Empty = run all features. */
function featurePathsFromSpec(raw: string | undefined): string[] {
  const keys = raw
    ?.split(/[,;]/)
    .map(key => key.trim())
    .filter(Boolean);

  if (!keys?.length) {
    return [];
  }

  const files = fs.readdirSync(featuresDir).filter(file => file.endsWith('.feature'));

  return keys.flatMap(key => files.filter(file => file.includes(key)).map(file => path.join(featuresDir, file)));
}

function buildCodeceptArgs(): string[] {
  const args = ['run', '--steps'];
  const scope = process.env.E2E_TEST_SCOPE?.trim();

  if (scope) {
    args.push('--grep', scope);
  }

  const specPaths = featurePathsFromSpec(process.env.E2E_SPEC);
  if (specPaths.length > 0) {
    args.push(...specPaths);
  }

  return args;
}

const args = buildCodeceptArgs();
const scope = process.env.E2E_TEST_SCOPE?.trim();
const spec = process.env.E2E_SPEC?.trim();

console.log(
  `Running CodeceptJS functional tests` +
    (scope ? ` with E2E_TEST_SCOPE=${scope}` : ' (all scenarios)') +
    (spec ? `, E2E_SPEC=${spec}` : '')
);

const result = spawnSync('codeceptjs', args, { stdio: 'inherit' });
process.exit(result.status ?? 1);
