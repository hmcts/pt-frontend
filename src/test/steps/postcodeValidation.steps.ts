import { config as testConfig } from '../config';
import { ptApplyingFor } from '../functional/page-data/ptApplyingFor.page.data';
import { ptPostalCodeOutsideCoverage } from '../functional/page-data/ptPostalCodeOutsideCoverage.page.data';
import { postcodeData } from '../functional/page-data/ptpostcode.page.data';

const { I } = inject();

const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();
Given('I landed on postal code page successfully', () => {
  I.amOnPage(ptUrl(ptApplyingFor.applyingForUrl));
  I.waitForText(ptApplyingFor.pageHeading);
  I.checkOption(ptApplyingFor.applyingForMyselfOption);
  I.click(ptApplyingFor.continueButton);
  I.waitForText(ptPostalCodeOutsideCoverage.pageHeading);
});
When('I enter postcode {string}', (postcode: string) => {
  I.fillField('input[name="addressPostcode"]', postcode);
});
Then('I should see {string}', (outcome: string) => {
  I.see(outcome);
});
Then('I should see postcode validation error', () => {
  I.waitForText(postcodeData.errorMessage, 10, '.govuk-error-message');
});
