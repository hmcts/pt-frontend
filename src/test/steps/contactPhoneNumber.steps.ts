//import { config as testConfig } from '../config';
import { contactPhoneNumber } from '../functional/page-data/contactPhoneNumber.page.data';

const { I } = inject();
// const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

/**
10
* Page Load
11
*/

Given('the citizen is on the Contact Phone Number page', () => {
  I.click(contactPhoneNumber.contactPreferenceslink);
  I.waitForText(contactPhoneNumber.pageHeading, 10);
  I.checkOption(contactPhoneNumber.textUpdateNoRadioButton);
  I.click(contactPhoneNumber.saveAndContinueButton);
});

/**
19
* Phone Number Entry
20
*/

When('the citizen enters a valid mobile phone number', () => {
  I.fillField(contactPhoneNumber.phoneNumberField, contactPhoneNumber.validMobileNumber);
});

When('the citizen enters a valid landline phone number', () => {
  I.fillField(contactPhoneNumber.phoneNumberField, contactPhoneNumber.validLandlineNumber);
});

When('the citizen enters an invalid phone number', () => {
  I.fillField(contactPhoneNumber.phoneNumberField, contactPhoneNumber.invalidPhoneNumber);
});

When('the citizen leaves the contact phone number blank', () => {
  I.fillField(contactPhoneNumber.phoneNumberField, '');
});

/**
51
* Actions
52
*/

When('the citizen clicks contact phone Save and continue', () => {
  I.click(contactPhoneNumber.saveAndContinueButton);
});

When('the citizen clicks contact phone Save for later', () => {
  I.click(contactPhoneNumber.saveForLaterButton);
});

/**
63
* Navigation
64
*/

Then('the citizen is navigated to the Check Your Answers page', () => {
  I.waitForText(contactPhoneNumber.checkYourAnswersHeading);
});

/**
81
* Validation
82
*/

Then('the citizen sees the phone number format validation error', () => {
  I.see(contactPhoneNumber.phoneNumberError, contactPhoneNumber.errorSummarySelector);

  I.see(contactPhoneNumber.phoneNumberError);
});
