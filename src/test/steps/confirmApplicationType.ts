import { ptConfirmApplicationType } from '../functional/page-data/ptConfirmApplicationType.page.data';

const { I } = inject();

// const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

Given('I am on the "What type of application do you want to make" page', () => {
  I.amOnPage(ptConfirmApplicationType.applyingForUrl);
  I.waitForText(ptConfirmApplicationType.pageHeading);
});

Given('I select the "Open market rent determination application" option', () => {
  I.checkOption(ptConfirmApplicationType.openMarketRentDeterminationApplication);
});

Then('I am taken to the "Who is named on your tenancy" page', () => {
  I.waitForText(ptConfirmApplicationType.whoIsNamedOnYourTenancy);
});

When('I select the "Only challenge the legal validity of a landlord notice proposing a new rent" option', () => {
  I.checkOption(ptConfirmApplicationType.challengeLegalValidityOption);
});

Then('I am taken to challenging legal validation notice page', () => {
  I.waitForText(ptConfirmApplicationType.challengeLegalValidityOptionHeading);
});

Then('I can see error message is displayed', () => {
  I.waitForText(ptConfirmApplicationType.validationErrorHeading);
  I.waitForText(ptConfirmApplicationType.validationErrorMessage, 10, '.govuk-error-summary');
});

When('I selects download paper form', () => {
  I.click(ptConfirmApplicationType.downloadPaperForm);
  I.waitForNumberOfTabs(2, 10);
  I.switchToNextTab();
});

Then('I am taken in to  the paper application form', () => {
  I.waitInUrl(ptConfirmApplicationType.paperApplicationFormUrl);
  I.closeCurrentTab();
});
