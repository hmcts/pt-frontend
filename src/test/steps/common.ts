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

When('I select the option {string} under {string}', (option: string, question: string) => {
  I.waitForText(question);
  I.checkOption(option);
});

When('I click {string}', (buttonText: string) => {
  I.click(buttonText);
});

When('I click {string} link', (linkText: string) => {
  I.click(linkText);
});

Then('the page should include {string}', (text: string) => {
  I.waitForText(text);
});
