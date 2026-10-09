import { myApplication } from '../functional/page-data/myapplication.page.data';
import { resolveIdamEmail, resolveIdamPassword } from '../functional/utils/idamPassword';

import { submitSignInCredentials, verifyRedirectedToPtUI } from './idam-login';

const { I } = inject();

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

When('I add other charge details in description as {string}', (description: string) => {
  I.fillField('Describe what you are charged separately for', description);
});

Then('I check that the text {string} is displayed on the page', (text: string) => {
  I.waitForText(text);
});

When('I click back link', () => {
  I.click('Back');
});

When(
  'I enter characters more than {string} in the description field for the question {string}',
  async (maxLength: string, question: string) => {
    const limit = Number(maxLength);
    const value = 'c'.repeat(limit + 1);

    await I.usePlaywrightTo('enter a description exceeding the limit', async ({ page }) => {
      const textarea = page.getByRole('textbox', { name: question, exact: true });
      await textarea.waitFor({ state: 'visible', timeout: 30000 });
      await textarea.fill(value);
    });
  }
);
