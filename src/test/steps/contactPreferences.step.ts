import { expect } from '@playwright/test';

import { contactPreferences } from '../functional/page-data/contactPreferences.page.data';
import { changeLink, summaryAnswer, summaryRow } from '../functional/utils/commonLocators';

const { I } = inject();

async function expectSummaryRow(question: string, answer: string): Promise<void> {
  await I.usePlaywrightTo(`check summary row "${question}"`, async ({ page }) => {
    await expect(summaryRow(page, question)).toHaveCount(1);
    await expect(summaryAnswer(page, question)).toHaveText(answer);
    await expect(changeLink(page, question)).toBeVisible();
  });
}

Then('I check that user is redirected to the {string} page', (heading: string) => {
  I.waitInUrl(contactPreferences.checkAnswersUrl);
  I.waitForText(heading);
});

Then('I should see the section heading {string}', async (heading: string) => {
  await I.usePlaywrightTo('check contact preferences section heading', async ({ page }) => {
    await page
      .locator(contactPreferences.sectionCaptionSelector)
      .getByText(heading, { exact: true })
      .waitFor({ state: 'visible' });
  });
});

Then('I should see the answer {string} for {string} and the change link', async (answer: string, question: string) => {
  await expectSummaryRow(question, answer);
});

Then('I should not see the summary row for {string}', async (question: string) => {
  await I.usePlaywrightTo(`check summary row "${question}" is absent`, async ({ page }) => {
    await expect(summaryRow(page, question)).toHaveCount(0);
  });
});

Then('I should see the mobile phone number {string} and the change link', async (phoneNumber: string) => {
  await expectSummaryRow(contactPreferences.mobilePhoneQuestion, phoneNumber);
});

Then('I should see the phone call number {string} and the change link', async (phoneNumber: string) => {
  await expectSummaryRow(contactPreferences.phoneCallsQuestion, phoneNumber);
});

Then('I should be taken to the text updates page', () => {
  I.waitInUrl(contactPreferences.textUpdatesUrl);
  I.waitForText(contactPreferences.textUpdatesHeading);
});

Then('I should be taken to the contact by phone call page', () => {
  I.waitInUrl(contactPreferences.contactByPhoneUrl);
  I.waitForText(contactPreferences.contactByPhoneHeading);
});

Then('"Yes" should be selected for text updates', async () => {
  await I.usePlaywrightTo('check Yes is selected for text updates', async ({ page }) => {
    const yesOption = page.getByLabel(contactPreferences.textUpdatesYesOption, { exact: true });
    await yesOption.waitFor({ state: 'visible' });
    if (!(await yesOption.isChecked())) {
      throw new Error('Expected Yes to be selected for text updates');
    }
  });
});

Then('the mobile phone number field should contain {string}', async (phoneNumber: string) => {
  await I.usePlaywrightTo('check mobile phone number value', async ({ page }) => {
    const phoneField = page.getByLabel(contactPreferences.mobilePhoneQuestion, { exact: true });
    await phoneField.waitFor({ state: 'visible' });
    const actualPhoneNumber = await phoneField.inputValue();
    if (actualPhoneNumber !== phoneNumber) {
      throw new Error(`Expected mobile phone number ${phoneNumber}, got ${actualPhoneNumber}`);
    }
  });
});

Then('the phone number field should contain {string}', async (phoneNumber: string) => {
  await I.usePlaywrightTo('check phone number value', async ({ page }) => {
    const phoneField = page.getByLabel(contactPreferences.phoneCallsQuestion, { exact: true });
    await phoneField.waitFor({ state: 'visible' });
    const actualPhoneNumber = await phoneField.inputValue();
    if (actualPhoneNumber !== phoneNumber) {
      throw new Error(`Expected phone number ${phoneNumber}, got ${actualPhoneNumber}`);
    }
  });
});
