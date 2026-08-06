import { config as testConfig } from '../config';
import { ptApplyingFor } from '../functional/page-data/ptApplyingFor.page.data';
import { ptNonEnglishPostCode } from '../functional/page-data/ptNonEnglishPostCode.page.data';
import { ptPostalCodeOutsideCoverage } from '../functional/page-data/ptPostalCodeOutsideCoverage.page.data';
const { I } = inject();

const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

Given(
  'I enter non english postal code and navigate to the "Sorry, this service is only available in England" page',
  () => {
    I.amOnPage(ptUrl(ptApplyingFor.applyingForUrl));
    I.waitForText(ptApplyingFor.pageHeading);
    I.checkOption(ptApplyingFor.applyingForMyselfOption);
    I.click(ptApplyingFor.continueButton);
    I.waitForText(ptPostalCodeOutsideCoverage.pageHeading);
    I.fillField('input[name="addressPostcode"]', ptNonEnglishPostCode.nonEnglishpostcode);
    I.click(ptPostalCodeOutsideCoverage.continueButton);
    I.waitForText(ptNonEnglishPostCode.pageHeading);
  }
);

When('I select scotland link', () => {
  I.click(ptNonEnglishPostCode.scotlandLink);
  I.waitForNumberOfTabs(2, 10);
  I.switchToNextTab();
});

When('I select wales link', () => {
  I.click(ptNonEnglishPostCode.walesLink);
  I.waitForNumberOfTabs(2, 10);
  I.switchToNextTab();
});

When('I select the guidance gov.uk link', () => {
  I.click(ptNonEnglishPostCode.guidanceLink);
  I.waitForNumberOfTabs(2, 10);
  I.switchToNextTab();
});

Then('I should be redirected to rentalrights page', () => {
  I.waitInUrl(ptNonEnglishPostCode.renterRightsUrl);
  I.waitForText(ptNonEnglishPostCode.renterRightsHeading);
});

Then('I should be redirected to notice-variation-rent-form', () => {
  I.waitInUrl(ptNonEnglishPostCode.noticeVariationRentFromUrl);
});

Then('I should be redirected to the GOV.UK guidance page', () => {
  I.waitInUrl(ptNonEnglishPostCode.guidanceUrl);
});
