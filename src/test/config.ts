process.env.NODE_CONFIG_ENV = process.env.NODE_CONFIG_ENV || 'test';

// Load after NODE_CONFIG_ENV is set so config/test.json is merged in
// eslint-disable-next-line @typescript-eslint/no-require-imports
const appConfig = require('config');

// better handling of unhandled exceptions
process.on('unhandledRejection', reason => {
  throw reason;
});

const frontendUrl = String(appConfig.get('frontend.url')).replace(/\/$/, '');

export const config = {
  TEST_URL: process.env.TEST_URL || frontendUrl,
  IDAM_PT_USER_EMAIL: process.env.IDAM_PT_USER_EMAIL || String(appConfig.get('idam.testUser.email')),
  IDAM_PT_USER_PASSWORD: process.env.IDAM_PT_USER_PASSWORD || '',
  TestHeadlessBrowser: process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : true,
  TestSlowMo: 250,
  WaitForTimeout: 10000,

  Gherkin: {
    features: './src/test/functional/features/**/*.feature',
    steps: './src/test/steps/**/*.ts',
  },
  helpers: {},
};

config.helpers = {
  Playwright: {
    url: config.TEST_URL,
    show: !config.TestHeadlessBrowser,
    browser: 'chromium',
    waitForTimeout: config.WaitForTimeout,
    waitForAction: 1000,
    waitForNavigation: 'networkidle0',
    ignoreHTTPSErrors: true,
  },
};
