import { config as testConfig } from '../config';
import { myApplication } from '../functional/page-data/myapplication.page.data';
import { resolveIdamEmail, resolveIdamPassword } from '../functional/utils/idamPassword';

import { selectOptionByLabel } from './common';
import { submitSignInCredentials, verifyRedirectedToPtUI } from './idam-login';

const { I } = inject();
const ocUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

async function usePlaywrightPage(action: (page: import('playwright').Page) => Promise<void>): Promise<void> {
  await I.usePlaywrightTo('run playwright action', async ({ page }) => action(page));
}

async function clickMyApplicationsLink(): Promise<void> {
  await usePlaywrightPage(async page => {
    await page
      .getByRole('heading', {
        name: /My applications/i,
      })
      .waitFor();

    await page.getByRole('link', { name: /Start a new application/i }).click({ force: true, timeout: 30000 });
  });
}

Given('the user has successfully logged on to market-rent-determination application', async () => {
  await submitSignInCredentials(resolveIdamEmail(), resolveIdamPassword(), { waitForPtRedirect: true });
  await verifyRedirectedToPtUI();
});

Then('check that the user is redirected to the my-application page', async () => {
  I.waitForText(myApplication.myApplicationPageHeading);
});

When('user clicks on the my application link', async () => {
  await clickMyApplicationsLink();
});

Then('check that the user is redirected to the application-type page', () => {
  I.waitInUrl(myApplication.startNewApplicationUrl);
  I.waitForText(myApplication.applicationTypeHeading);
});

Then('check that the user is redirected to the "tenancy-type" page', () => {
  I.waitInUrl(myApplication.tenancyTypeUrl);
  I.waitForText(myApplication.tenancyTypeHeading);
});

Then('I check that valid error message is displayed for the tenancy-type page', () => {
  I.waitForText(myApplication.tenancyTypeErrorMessage);
});

Then('check that the user is redirected to the task-list citizen dashboard page', () => {
  I.waitInUrl(myApplication.taskListUrl);
  I.waitForText(myApplication.taskListHeading);
});

When('I navigate to the other charges page', () => {
  I.amOnPage(ocUrl(myApplication.otherChargesUrl));
  I.waitForText(myApplication.otherChargesPageHeading);
});

When('I add other charge details in description as {string}', (description: string) => {
  I.fillField('Describe what you are charged separately for', description);
});

Then('I check that the text {string} is displayed on the page', (text: string) => {
  I.waitForText(text);
});

When('I click back link', () => {
  I.click('Back');
});

When('I enter characters more than 500 in the description field', () => {
  I.clearField('Describe what you are charged separately for');
  I.executeScript(value => {
    const textarea = document.querySelector('textarea');

    if (textarea instanceof HTMLTextAreaElement) {
      textarea.value = value;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, 'c'.repeat(501));
});

Then('I check that the error message {string} is displayed on the page', (message: string) => {
  I.waitForText(message);
});

When('I select the option {string} for the question {string}', (option: string) => {
  I.checkOption(option);
});

When('I select the option {string}', async (option: string) => {
  selectOptionByLabel(option);
});
