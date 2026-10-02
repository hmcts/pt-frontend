import { config as testConfig } from '../config';

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

export const selectOptionByLabel = (label: string): void => {
  I.checkOption(label);
};

When('I click {string}', (buttonText: string) => {
  I.click(buttonText);
});

When('I click {string} link', (linkText: string) => {
  I.click(linkText);
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

When('I select the option {string}', async (option: string) => {
  selectOptionByLabel(option);
});
