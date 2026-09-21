import { landlordPhoneNumber } from '../functional/page-data/landlordPhoneNumber.page.data';

const { I } = inject();

/**
10
* Page Load
11
*/

Given('the citizen is on the Landlord Phone Number page', () => {
  I.click(landlordPhoneNumber.landlordDetailsIncludingAnyRepresentativesLink);
  I.click(landlordPhoneNumber.saveAndContinueButton);
  I.fillField(landlordPhoneNumber.landlordEmailAddressField, landlordPhoneNumber.validEmailAddress);
  I.click(landlordPhoneNumber.saveAndContinueButton);
  I.waitForText(landlordPhoneNumber.pageHeading, 10);
});

/**
19
* Enter Phone Number
20
*/

When('the citizen enters a valid landlord phone number', () => {
  I.fillField(landlordPhoneNumber.phoneNumberField, landlordPhoneNumber.validPhoneNumber);
});

When('the citizen enters an invalid landlord phone number', () => {
  I.fillField(landlordPhoneNumber.phoneNumberField, landlordPhoneNumber.invalidPhoneNumber);
});

When('the citizen leaves the landlord phone number blank', () => {
  I.fillField(landlordPhoneNumber.phoneNumberField, '');
});

/**
44
* Actions
45
*/

When('the citizen clicks landlord phone Save and continue', () => {
  I.click(landlordPhoneNumber.saveAndContinueButton);
});

When('the citizen clicks landlord phone Save for later', () => {
  I.click(landlordPhoneNumber.saveForLaterButton);
});

/**
56
* Navigation
57
*/

Then('the citizen is navigated to the Does your landlord have a letting agent or representative page', () => {
  I.waitForText(landlordPhoneNumber.nextPageHeading);
});

Then('the citizen is returned to the application dashboard', () => {
  I.waitForText(landlordPhoneNumber.dashboardHeading);
});

/**
80
* Validation
81
*/

Then('the citizen sees the landlord phone number validation error', () => {
  I.see(landlordPhoneNumber.invalidPhoneNumberError, landlordPhoneNumber.errorSummarySelector);

  I.see(landlordPhoneNumber.invalidPhoneNumberError);
});
