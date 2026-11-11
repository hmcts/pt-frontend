import { expect } from '@playwright/test';

import { config as testConfig } from '../config';
import { commonPage } from '../functional/page-data/common.page.data';
import { changeLink, errorSummary } from '../functional/utils/commonLocators';

const { I } = inject();

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const iAmOnPage = (text: string): void => {
  const url = new URL(text, testConfig.TEST_URL);
  if (!url.searchParams.has('lng')) {
    url.searchParams.set('lng', 'en');
  }
  I.amOnPage(url.toString());
};
Given('I go to {string}', iAmOnPage);

Then('the page URL should be {string}', (url: string) => {
  I.waitInUrl(url);
});

Then('the page should include {string}', (text: string) => {
  I.waitForText(text);
});

Then('check that the user lands on the {string} page', (pageHeading: string) => {
  I.waitForText(pageHeading);
});

Then('I check that user lands on the {string} page', (pageHeading: string) => {
  I.waitForText(pageHeading);
});

Then('I should see the button {string}', async (buttonText: string) => {
  await I.usePlaywrightTo('check button is visible', async ({ page }) => {
    await page.locator('button').getByText(buttonText, { exact: true }).waitFor({ state: 'visible' });
  });
});

Then('no option should be selected for the question {string}', async (question: string) => {
  await I.usePlaywrightTo(`check no option is selected for "${question}"`, async ({ page }) => {
    const questionGroup = page.getByRole('group', { name: question, exact: true });

    await expect(questionGroup.getByRole('radio').first()).toBeVisible();
    await expect(questionGroup.getByRole('radio', { checked: true })).toHaveCount(0);
  });
});

Then('I should see an error summary link for {string}', async (errorMessage: string) => {
  await I.usePlaywrightTo(`check error summary link for "${errorMessage}"`, async ({ page }) => {
    const link = errorSummary(page).getByRole('link', { name: errorMessage, exact: true });
    await expect(link).toHaveAttribute('href', /^#.+/);

    const targetId = (await link.getAttribute('href'))?.slice(1) ?? '';
    await link.click();
    await expect(page.locator(`id=${targetId}`)).toBeFocused();
  });
});

Then('I should see inline error {string} for the question {string}', async (errorMessage: string, question: string) => {
  await I.usePlaywrightTo(`check inline error for "${question}"`, async ({ page }) => {
    const questionGroup = page.getByRole('group', { name: question, exact: true });
    const questionField = page.getByLabel(question, { exact: true });

    await expect(questionGroup.or(questionField)).toHaveAccessibleDescription(new RegExp(escapeRegex(errorMessage)));
  });
});

export const selectOptionByLabel = (label: string): void => {
  I.checkOption(label);
};

When('I click {string}', (buttonText: string) => {
  I.click(buttonText);
});

When('I click {string} link', (linkText: string) => {
  I.click(linkText);
});

When('I click the change link for {string}', async (question: string) => {
  await I.usePlaywrightTo(`click change link for "${question}"`, async ({ page }) => {
    await changeLink(page, question).click();
  });
});

When('I select {string} for the question {string}', (option: string, question: string) => {
  I.checkOption(option, locate('fieldset').withChild(locate('legend').withText(question)));
});

Then('I check {string} is selected for the question {string}', async (option: string, question: string) => {
  await I.usePlaywrightTo('check selected radio option by question', async ({ page }) => {
    const group = page.locator('fieldset').filter({
      has: page.locator('legend').getByText(question, { exact: true }),
    });
    const radio = group.getByLabel(option, { exact: true });
    await radio.waitFor({ state: 'visible' });
    if (!(await radio.isChecked())) {
      throw new Error(`Expected "${option}" to be selected for "${question}"`);
    }
  });
});

When('I enter {string} for the question {string}', (value: string, question: string) => {
  I.fillField(question, value);
});

When('I clear the field for the question {string}', async (question: string) => {
  await I.usePlaywrightTo('clear labeled field', async ({ page }) => {
    await page.getByLabel(question, { exact: true }).fill('');
  });
});

Then('I check {string} for the question {string}', async (expectedValue: string, question: string) => {
  await I.usePlaywrightTo('check labeled field value', async ({ page }) => {
    const field = page.getByLabel(question, { exact: true });
    await field.waitFor({ state: 'visible' });
    const actualValue = await field.inputValue();
    if (actualValue !== expectedValue) {
      throw new Error(`Expected field "${question}" to contain "${expectedValue}", got "${actualValue}"`);
    }
  });
});

When('I enter {string} for the label {string}', (value: string, label: string) => {
  I.fillField(label, value);
});

When('I enter {string} in {string}', (value: string, fieldLabel: string) => {
  I.fillField(fieldLabel, value);
});

Then('the field {string} with value {string} is {string}', (fieldName: string, value: string, visibility: string) => {
  if (visibility === 'displayed') {
    I.see(fieldName);
    I.see(value);
  } else if (visibility === 'not displayed') {
    I.dontSee(fieldName);
    I.dontSee(value);
  }
});

Then('the field {string} is {string}', (fieldName: string, visibility: string) => {
  if (visibility === 'displayed') {
    I.see(fieldName);
  } else if (visibility === 'not displayed') {
    I.dontSee(fieldName);
  }
});

Then('the field {string} is prepopulated with {string}', (fieldName: string, value: string) => {
  I.seeInField(fieldName, value);
});

When('I upload {string}', (fileType: string) => {
  switch (fileType) {
    case 'supported-file':
      I.attachFile(commonPage.uploadField, commonPage.validFile);
      I.wait(2);
      break;
    case 'empty-file':
      I.attachFile(commonPage.uploadField, commonPage.emptyFile);
      I.wait(2);
      break;

    case 'unsupported-file':
      I.attachFile(commonPage.uploadField, commonPage.unsupportedFile);
      break;

    case 'oversized-file':
      I.attachFile(commonPage.uploadField, commonPage.oversizedFile);
      break;

    case 'password-file':
      I.attachFile(commonPage.uploadField, commonPage.passwordProtectedFile);
      break;

    case 'no-file':
      break;
  }
});

When('I enter the date {string} for the question {string}', async (date: string, question: string) => {
  const match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    throw new Error(`Date "${date}" must be in DD/MM/YYYY format`);
  }
  const [, day, month, year] = match;

  await I.usePlaywrightTo('enter date parts', async ({ page }) => {
    const group = page.getByRole('group', { name: question, exact: true });
    await group.getByLabel('Day', { exact: true }).fill(day);
    await group.getByLabel('Month', { exact: true }).fill(month);
    await group.getByLabel('Year', { exact: true }).fill(year);
  });
});

Then('I check that the error message {string} is displayed on the page', (message: string) => {
  I.waitForText(message);
});

Then('I check for error message {string}', (message: string) => {
  I.waitForText(message);
});

Then(
  'I check that the user is redirected to the {string} page with heading {string}',
  (url: string, heading: string) => {
    I.waitInUrl(url);
    I.waitForText(heading);
  }
);

When('I select the option {string}', async (option: string) => {
  selectOptionByLabel(option);
});
