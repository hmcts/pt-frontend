import { config as testConfig } from '../config';
import { ptStartingOrReturning } from '../functional/page-data/ptStartingOrReturning.page.data';

const { I } = inject();

const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

Given('the citizen is on the Starting Or Returning Application page', () => {
  I.amOnPage(ptUrl(ptStartingOrReturning.startingOrReturningUrl));

  I.waitForText(ptStartingOrReturning.pageHeading);
});

When('the citizen selects start a new application', () => {
  I.checkOption(ptStartingOrReturning.startingOptionLabel);

  I.click(ptStartingOrReturning.continueButton);
});

When('the citizen selects return to an application', () => {
  I.checkOption(ptStartingOrReturning.returningOptionLabel);

  I.click(ptStartingOrReturning.continueButton);
});
Then('the citizen is taken to the apply for yourself or someone else page', () => {
  I.waitForText(ptStartingOrReturning.startApplicationHeading);
});

When('the citizen clicks continue without selecting an option', () => {
  I.click(ptStartingOrReturning.continueButton);
});

Then('the citizen is taken to the sign in or create account page', () => {
  I.waitForText(ptStartingOrReturning.signInOrCreateHeading);
});

Then('the citizen  can see the standard UCD validation message', () => {
  I.waitForText(ptStartingOrReturning.validationErrorMessage);
});
