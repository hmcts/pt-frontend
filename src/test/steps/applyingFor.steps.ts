import { config as testConfig } from '../config';
import { ptApplyingFor } from '../functional/page-data/ptApplyingFor.page.data';
import { ptStartingOrReturning } from '../functional/page-data/ptStartingOrReturning.page.data';

const { I } = inject();

const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

Given('the citizen is on the Applying For page', () => {
  I.amOnPage(ptUrl(ptStartingOrReturning.startingOrReturningUrl));

  I.waitForText(ptStartingOrReturning.pageHeading);
  I.checkOption(ptStartingOrReturning.startingOptionLabel);

  I.click(ptStartingOrReturning.continueButton);

  I.waitForText(ptApplyingFor.pageHeading, 10);
});

When('the citizen selects applying for myself', () => {
  I.checkOption(ptApplyingFor.applyingForMyselfOption);
});

When('the citizen selects applying on behalf of someone else', () => {
  I.checkOption(ptApplyingFor.applyingForSomeoneElseOption);
});

When('the citizen clicks continue', () => {
  I.click(ptApplyingFor.continueButton);
});

Then('the citizen is taken to the postcode triage page', () => {
  I.waitForText(ptApplyingFor.postcodeTriageHeading);
});

Then('the citizen is taken to the another form guidance page', () => {
  I.waitForText(ptApplyingFor.anotherFormHeading);
});

Then('the citizen sees the standard UCD validation message', () => {
  I.waitForText(ptApplyingFor.validationErrorHeading);

  I.waitForText(ptApplyingFor.validationErrorMessage);
});
