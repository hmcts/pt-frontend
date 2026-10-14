import { propertyAddress } from '../functional/page-data/propertyAddress.page.data';

const { I } = inject();

Given('the citizen is on the Property Address page', () => {
  I.click(propertyAddress.propertyDetail);
  I.waitForText(propertyAddress.pageHeading, 10);
});

Then('the property address page displays all expected content', () => {
  I.see(propertyAddress.pageHeading, 'h1');
  I.see(propertyAddress.addressLine1);
  I.see(propertyAddress.addressLine2);
  I.see(propertyAddress.townOrCity);
  I.see(propertyAddress.county);
  I.see(propertyAddress.postcode);
  I.see(propertyAddress.saveAndContinueButton);
  I.see(propertyAddress.saveForLaterButton);
});

When('the citizen enters valid mandatory property address details', () => {
  I.fillField('Address line 1', propertyAddress.validAddressLine1);
  I.fillField('Town or city', propertyAddress.validTownOrCity);
  I.fillField('Postcode', propertyAddress.validPostcode);
});

When('the citizen leaves optional property address fields blank', () => {
  // Intentionally blank
});

When('the citizen clicks property address Save and continue', () => {
  I.click(propertyAddress.saveAndContinueButton);
});

When('the citizen clicks property address Save for later', () => {
  I.click(propertyAddress.saveForLaterButton);
});

Then('the citizen is navigated to the What are you renting page', () => {
  I.waitForText(propertyAddress.nextPageHeading, 10);
});

Then('the citizen is returned to the application dashboard', () => {
  I.waitForText(propertyAddress.dashboardHeading, 10);
  I.see(propertyAddress.dashboardHeading);
});

Then('no optional field validation errors are displayed', () => {
  I.dontSee(propertyAddress.addressLine2MinLengthError);
  I.dontSee(propertyAddress.countyMinLengthError);
});

Then('the citizen sees the property address mandatory field validation errors', () => {
  I.seeElement(propertyAddress.errorSummarySelector);
  I.see(propertyAddress.addressLine1RequiredError);
  I.see(propertyAddress.townOrCityRequiredError);
  I.see(propertyAddress.postcodeRequiredError);
});

When('the citizen enters an invalid postcode', () => {
  I.fillField('Address line 1', propertyAddress.validAddressLine1);
  I.fillField('Town or city', propertyAddress.validTownOrCity);
  I.fillField('Postcode', propertyAddress.invalidPostcode);
});

Then('the citizen sees the invalid postcode validation error', () => {
  I.see(propertyAddress.postcodeInvalidError);
});

When('the citizen enters an Address Line 1 value less than 2 characters', () => {
  I.fillField('Address line 1', 'A');
  I.fillField('Town or city', propertyAddress.validTownOrCity);
  I.fillField('Postcode', propertyAddress.validPostcode);
});

Then('the citizen sees the Address Line 1 minimum length validation error', () => {
  I.see(propertyAddress.addressLine1MinLengthError);
});

When('the citizen enters an Address Line 2 value less than 2 characters', () => {
  I.fillField('Address line 1', propertyAddress.validAddressLine1);
  I.fillField('Address line 2', 'A');
  I.fillField('Town or city', propertyAddress.validTownOrCity);
  I.fillField('Postcode', propertyAddress.validPostcode);
});

Then('the citizen sees the Address Line 2 minimum length validation error', () => {
  I.see(propertyAddress.addressLine2MinLengthError);
});

When('the citizen enters a Town or City value less than 2 characters', () => {
  I.fillField('Address line 1', propertyAddress.validAddressLine1);
  I.fillField('Town or city', 'A');
  I.fillField('Postcode', propertyAddress.validPostcode);
});

Then('the citizen sees the Town or City minimum length validation error', () => {
  I.see(propertyAddress.townOrCityMinLengthError);
});

When('the citizen enters a County value less than 2 characters', () => {
  I.fillField('Address line 1', propertyAddress.validAddressLine1);
  I.fillField('Town or city', propertyAddress.validTownOrCity);
  I.fillField('County', 'A');
  I.fillField('Postcode', propertyAddress.validPostcode);
});

Then('the citizen sees the County minimum length validation error', () => {
  I.see(propertyAddress.countyMinLengthError);
});
