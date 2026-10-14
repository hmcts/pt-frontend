#!/usr/bin/env bash
# Runs CodeceptJS functional tests. Skips when Jenkins sets RUN_FUNCTIONAL_TESTS=false
# (PR builds without an e2e-tag: or e2e-spec: label). Defaults to running locally.
set -euo pipefail

if [ "${RUN_FUNCTIONAL_TESTS:-true}" = false ]; then
  echo "Skipping functional tests: add an e2e-tag: or e2e-spec: label to this PR to run them"
  exit 0
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT_DIR"

mkdir -p functional-output/zephyr
yarn playwright install
codeceptjs run --steps
tsx zephyr-scripts/postprocess-cucumber-report.ts
