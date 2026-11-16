import { isMainThread, threadId } from 'node:worker_threads';

import { config as testConfig } from './src/test/config';
import { useTemporaryCitizen } from './src/test/functional/utils/temporaryIdamUser';

const { setHeadlessWhen } = require('@codeceptjs/configure');

setHeadlessWhen(testConfig.TestHeadlessBrowser);
const e2eTag = process.env.E2E_TEST_SCOPE?.trim();
// Workers share a process, so a single cucumber JSON file would be overwritten.
// Each worker thread writes its own file; run.sh merges them after the run.
const cucumberReportFile = isMainThread
  ? '../../zephyr/cucumber-report.json'
  : `../../zephyr/cucumber-report.worker-${threadId}.json`;
export const config: CodeceptJS.MainConfig = {
  bootstrap: async () => {
    await useTemporaryCitizen();
  },
  name: 'functional',
  ...(e2eTag ? { grep: e2eTag } : {}),
  gherkin: testConfig.Gherkin,
  output: './functional-output/functional/reports',
  helpers: testConfig.helpers,
  tests: './*_test.{js,ts}',
  // Scenario retries a failed scenario. Before retries the Gherkin Background,
  // which a plain number does not cover. Both are extra attempts after the first run.
  retry: {
    Scenario: 2,
    Before: 2,
  },
  plugins: {
    // Codecept 4 replays worker events on the main process. These plugins expect
    // the live test, browser, or Gherkin feature, which only exist inside a worker
    // (and on a serial run, where worker mode is off).
    allure: {
      enabled: true,
      require: '@codeceptjs/allure-legacy',
      runInParent: false,
    },
    pauseOnFail: {
      enabled: !testConfig.TestHeadlessBrowser,
      runInParent: false,
    },
    retryFailedStep: {
      enabled: true,
      retries: 1,
      runInParent: false,
    },
    tryTo: {
      enabled: false,
    },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true,
      runInParent: false,
    },
    cucumberJsonReporter: {
      enabled: true,
      runInParent: false,
      // Guards the published reporter so a missing step result cannot fail a Background.
      require: './src/test/functional/plugins/cucumberJsonReporter.js',
      attachScreenshots: true,
      attachComments: true,
      outputFile: cucumberReportFile,
    },
  },
};
