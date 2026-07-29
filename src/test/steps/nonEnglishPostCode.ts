import { config as testConfig } from '../config';
import { ptApplyingFor } from '../functional/page-data/ptApplyingFor.page.data';
import { ptNonEnglishPostCode } from '../functional/page-data/ptNonEnglishPostCode.page.data';
import { ptPostalCodeOutsideCoverage } from '../functional/page-data/ptPostalCodeOutsideCoverage.page.data';
const { I } = inject();

const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();
Given('I am on the "Sorry, this service is only available in England" page', () => {
  I.amOnPage(ptUrl(ptApplyingFor.applyingForUrl));
  I.waitForText(ptApplyingFor.pageHeading);
  I.checkOption(ptApplyingFor.applyingForMyselfOption);
  I.click(ptApplyingFor.continueButton);
  I.waitForText(ptPostalCodeOutsideCoverage.pageHeading);
  I.fillField('input[name="addressPostcode"]', ptNonEnglishPostCode.nonEnglishpostcode);
  I.click(ptPostalCodeOutsideCoverage.continueButton);
  I.waitForText(ptNonEnglishPostCode.pageHeading);
});

When('I select scotland link', () => {
  I.click(ptNonEnglishPostCode.scotlandLink);
});
When('I select wales link', () => {
  I.click(ptNonEnglishPostCode.walesLink);
});

When('I select the guidance gov.uk link', () => {
  I.click(ptNonEnglishPostCode.guidanceLink);
});
Then('I should be redirected rentalrights page', () => {
  I.waitForText(ptNonEnglishPostCode.renterRightsHeading);
  I.waitForText(ptNonEnglishPostCode.renterRightsUrl);
});
Then('I should be redirected to notice-variation-rent-form', () => {
  I.waitForText(ptNonEnglishPostCode.noticeVariationRentFromUrl);
});

Then('I should be redirected to the GOV.UK guidance page', () => {
  I.waitForText(ptNonEnglishPostCode.guidanceUrl);
});
