import { config as testConfig } from './src/test/config';

const { setHeadlessWhen } = require('@codeceptjs/configure');

setHeadlessWhen(testConfig.TestHeadlessBrowser);
const e2eTag = process.env.E2E_TEST_SCOPE?.trim();
export const config: CodeceptJS.MainConfig = {
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
      outputFile: '../../zephyr/cucumber-report.json',
    },
  },
};
