#!/usr/bin/env bash
# Runs CodeceptJS functional tests. Skips when Jenkins sets RUN_FUNCTIONAL_TESTS=false
# (PR builds without an e2e-tag: or e2e-spec: label). Defaults to running locally.
#
# The @regression pack (nightly job and PRs labelled e2e-tag:@regression) runs across
# several workers. Feature files stay intact on one worker. @smoke, @idam, and
# spec-only runs stay serial. E2E_WORKERS overrides the count; 1 forces serial.
set -euo pipefail

if [ "${RUN_FUNCTIONAL_TESTS:-true}" = false ]; then
  echo "Skipping functional tests: add an e2e-tag: or e2e-spec: label to this PR to run them"
  exit 0
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT_DIR"

# Codecept 3.7 leaves a worker thread open when it is given no tests, which hangs
# the job. Never start more workers than matching feature files.
REGRESSION_WORKERS=4

trim() {
  local value="$1"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

matching_feature_count() {
  local dir="$ROOT_DIR/src/test/functional/features"
  local scope spec count file name key matched rest
  local -a keys
  scope="$(trim "${E2E_TEST_SCOPE:-}")"
  spec="$(trim "${E2E_SPEC:-}")"
  count=0

  shopt -s nullglob
  for file in "$dir"/*.feature; do
    name="$(basename "$file")"
    if [ -n "$spec" ]; then
      matched=false
      rest="${spec//;/,}"
      IFS=',' read -ra keys <<< "$rest"
      for key in "${keys[@]}"; do
        key="$(trim "$key")"
        if [ -n "$key" ] && [[ "$name" == *"$key"* ]]; then
          matched=true
          break
        fi
      done
      if [ "$matched" != true ]; then
        continue
      fi
    fi
    if [ -n "$scope" ] && ! grep -q -F -- "$scope" "$file"; then
      continue
    fi
    count=$((count + 1))
  done
  shopt -u nullglob
  printf '%s' "$count"
}

resolve_workers() {
  local requested scope count
  requested="$(trim "${E2E_WORKERS:-}")"
  scope="$(trim "${E2E_TEST_SCOPE:-}")"

  if [ -z "$requested" ]; then
    if [ "$scope" = "@regression" ]; then
      requested="$REGRESSION_WORKERS"
    else
      requested=1
    fi
  fi

  if ! [[ "$requested" =~ ^[1-9][0-9]*$ ]]; then
    echo "E2E_WORKERS must be a positive integer, got: ${E2E_WORKERS}" >&2
    exit 1
  fi

  count="$(matching_feature_count)"
  if [ "$count" -gt 0 ] && [ "$requested" -gt "$count" ]; then
    echo "Capping functional workers from ${requested} to ${count} so every worker has a feature file" >&2
    requested="$count"
  fi

  printf '%s' "$requested"
}

mkdir -p functional-output/zephyr
# Drop reports from an earlier run so a parallel merge cannot pick up stale worker files.
rm -f functional-output/zephyr/cucumber-report.json functional-output/zephyr/cucumber-report.worker-*.json
yarn playwright install

workers="$(resolve_workers)"
code=0
if [ "$workers" -gt 1 ]; then
  echo "Running functional tests with ${workers} workers (each feature file stays on one worker)"
  codeceptjs run-workers "$workers" --by suite || code=$?
else
  echo "Running functional tests in a single worker"
  codeceptjs run --steps || code=$?
fi

tsx zephyr-scripts/postprocess-cucumber-report.ts
exit "$code"
