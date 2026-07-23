import { config as testConfig } from '../config';
import { landlordHousingAssociation } from '../functional/page-data/ptLandlordHousingAssociation.page.data';

const { I } = inject();

const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

Given('the citizen is on the landlord housing association page', () => {
  I.amOnPage(ptUrl(landlordHousingAssociation.landingHousingAssociationUrl));

  I.waitForText(landlordHousingAssociation.pageHeading);
});
When('the citizen selects No', () => {
  I.click(landlordHousingAssociation.noOption);
});
When('the citizen selects Yes', () => {
  I.click(landlordHousingAssociation.yesOption);
});
When('the citizen clicks Continue', () => {
  I.click(landlordHousingAssociation.continueButton);
});
Then('the citizen is taken to the IDAM account creation page', () => {
  I.waitInUrl('/idam');
});
Then('the citizen is taken to the you need to use another form page', () => {
  I.waitForText(landlordHousingAssociation.anotherFormPageHeading);
});

Then('the citizen sees the standard UCD validation message', () => {
  I.waitForText(landlordHousingAssociation.validationErrorMessage, 10, '.govuk-error-summary');
});
