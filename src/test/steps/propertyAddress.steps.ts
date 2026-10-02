import { propertyAddress } from '../functional/page-data/propertyAddress.page.data';

const { I } = inject();

Given('the citizen is on the Property Address page', () => {
  I.click(propertyAddress.propertyDetail);
  I.waitForText(propertyAddress.pageHeading, 10);
});

Then('the property address page displays all expected content', () => {
  I.see(propertyAddress.pageHeading);
  I.see(propertyAddress.addressLine1);
  I.see(propertyAddress.addressLine2);
  I.see(propertyAddress.townOrCity);
  I.see(propertyAddress.county);
  I.see(propertyAddress.postcode);
  I.see(propertyAddress.saveAndContinueButton);
  I.see(propertyAddress.saveForLaterButton);
});

When('the citizen enters valid mandatory property address details', () => {
  I.fillField(propertyAddress.addressLine1, propertyAddress.validAddressLine1);
  I.fillField(propertyAddress.townOrCity, propertyAddress.validTownOrCity);
  I.fillField(propertyAddress.postcode, propertyAddress.validPostcode);
});

Then('the citizen is navigated to the What are you renting page', () => {
  I.waitForText(propertyAddress.nextPageHeading, 10);
});

When('the citizen enters an invalid postcode', () => {
  I.fillField(propertyAddress.addressLine1, propertyAddress.validAddressLine1);
  I.fillField(propertyAddress.townOrCity, propertyAddress.validTownOrCity);
  I.fillField(propertyAddress.postcode, propertyAddress.invalidPostcode);
});

When('the citizen enters an Address Line 1 value less than 2 characters', () => {
  I.fillField(propertyAddress.addressLine1, propertyAddress.singledigit);
  I.fillField(propertyAddress.townOrCity, propertyAddress.validTownOrCity);
  I.fillField(propertyAddress.postcode, propertyAddress.validPostcode);
});

When('the citizen enters an Address Line 2 value less than 2 characters', () => {
  I.fillField(propertyAddress.addressLine1, propertyAddress.validAddressLine1);
  I.fillField(propertyAddress.addressLine2, propertyAddress.singledigit);
  I.fillField(propertyAddress.townOrCity, propertyAddress.validTownOrCity);
  I.fillField(propertyAddress.postcode, propertyAddress.validPostcode);
});

When('the citizen enters a Town or City value less than 2 characters', () => {
  I.fillField(propertyAddress.addressLine1, propertyAddress.validAddressLine1);
  I.fillField(propertyAddress.townOrCity, propertyAddress.singledigit);
  I.fillField(propertyAddress.postcode, propertyAddress.validPostcode);
});

When('the citizen enters a County value less than 2 characters', () => {
  I.fillField(propertyAddress.addressLine1, propertyAddress.validAddressLine1);
  I.fillField(propertyAddress.townOrCity, propertyAddress.validTownOrCity);
  I.fillField(propertyAddress.county, propertyAddress.singledigit);
  I.fillField(propertyAddress.postcode, propertyAddress.validPostcode);
});
