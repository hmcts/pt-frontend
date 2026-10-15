import { config as testConfig } from './src/test/config';

const { setHeadlessWhen } = require('@codeceptjs/configure');

setHeadlessWhen(testConfig.TestHeadlessBrowser);
export const config: CodeceptJS.MainConfig = {
  name: 'functional',
  gherkin: testConfig.Gherkin,
  output: './functional-output/functional/reports',
  helpers: testConfig.helpers,
  tests: './*_test.{js,ts}',
  retry: 2,
  plugins: {
    allure: {
      enabled: true,
      require: '@codeceptjs/allure-legacy',
      outputDir: './functional-output/allure-results',
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
    allureStepScreenshots: {
      enabled: true,
      require: './src/test/plugins/allureStepScreenshots.js',
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
