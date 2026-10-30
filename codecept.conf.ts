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
  retry: 2,
  plugins: {
    allure: {
      enabled: true,
      require: '@codeceptjs/allure-legacy',
    },
    pauseOnFail: {
      enabled: !testConfig.TestHeadlessBrowser,
    },
    retryFailedStep: {
      enabled: true,
      retries: 1,
    },
    tryTo: {
      enabled: false,
    },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true,
    },
    cucumberJsonReporter: {
      enabled: true,
      require: 'codeceptjs-cucumber-json-reporter',
      attachScreenshots: true,
      attachComments: true,
      outputFile: cucumberReportFile,
    },
  },
};
