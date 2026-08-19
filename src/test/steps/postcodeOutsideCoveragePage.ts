import { config as testConfig } from '../config';
import { ptApplyingFor } from '../functional/page-data/ptApplyingFor.page.data';
import { ptPostalCodeOutsideCoverage } from '../functional/page-data/ptPostalCodeOutsideCoverage.page.data';

const { I } = inject();
const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

Given('I am on the postcode outside coverage page', () => {
  I.amOnPage(ptUrl(ptApplyingFor.applyingForUrl));
  I.waitForText(ptApplyingFor.pageHeading);
  I.checkOption(ptApplyingFor.applyingForMyselfOption);
  I.click(ptApplyingFor.continueButton);
  I.waitForText(ptPostalCodeOutsideCoverage.pageHeading);
  I.fillField('input[name="addressPostcode"]', ptPostalCodeOutsideCoverage.postcode);
  I.click(ptPostalCodeOutsideCoverage.continueButton);
});
