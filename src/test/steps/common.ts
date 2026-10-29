import { config as testConfig } from '../config';
import { commonPage } from '../functional/page-data/common.page.data';

const { I } = inject();

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
  await I.usePlaywrightTo('click change link for summary answer', async ({ page }) => {
    const row = page.locator(commonPage.summaryRowSelector).filter({
      has: page.locator(commonPage.summaryKeySelector).getByText(question, { exact: true }),
    });
    await row
      .locator(commonPage.summaryActionsSelector)
      .locator(commonPage.summaryActionLinkSelector)
      .filter({ hasText: commonPage.changeLinkLabel })
      .click();
  });
});

When('I select {string} for the question {string}', (option: string, question: string) => {
  I.checkOption(option, locate('fieldset').withChild(locate('legend').withText(question)));
});

When('I enter {string} for the question {string}', (value: string, question: string) => {
  I.fillField(question, value);
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
