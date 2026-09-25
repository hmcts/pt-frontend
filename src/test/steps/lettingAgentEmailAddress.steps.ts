import { landlordPhoneNumber } from '../functional/page-data/landlordPhoneNumber.page.data';
import { lettingAgentEmailAddress } from '../functional/page-data/lettingAgentEmailAddress.page.data';

const { I } = inject();

/**
6
* AC1 - Page Load
7
*/
Given("the citizen is on the letting agent's email address page", () => {
  I.click(landlordPhoneNumber.landlordDetailsIncludingAnyRepresentativesLink);
  I.click(landlordPhoneNumber.saveAndContinueButton);
  I.fillField(landlordPhoneNumber.landlordEmailAddressField, landlordPhoneNumber.validEmailAddress);
  I.click(landlordPhoneNumber.saveAndContinueButton);
  I.waitForText(landlordPhoneNumber.pageHeading, 10);
  I.click(landlordPhoneNumber.saveAndContinueButton);
  I.checkOption(lettingAgentEmailAddress.lettingAgentRadioBtn);
  I.waitForText(lettingAgentEmailAddress.pageHeading, 10);
});

/**
14
* AC2 - Email Entry
15
*/
When('the citizen enters a valid email address', () => {
  I.fillField(lettingAgentEmailAddress.emailField, lettingAgentEmailAddress.validEmail);
});

When('the citizen leaves the email field blank', () => {
  I.fillField(lettingAgentEmailAddress.emailField, '');
});

When('the citizen enters an invalid email address', () => {
  I.fillField(lettingAgentEmailAddress.emailField, lettingAgentEmailAddress.invalidEmail);
});

/**
35
* Continue
36
*/
When('the citizen clicks Save and continue', () => {
  I.click(lettingAgentEmailAddress.saveAndContinueButton);
});

/**
42
* AC2 - Navigation
43
*/

Then("the citizen is taken to the letting agent's phone number page", () => {
  I.waitForText(lettingAgentEmailAddress.nextPageHeading, 10);
});

/**
55
* AC3 - Validation
56
*/

Then('the email address validation error is displayed', () => {
  I.seeElement(lettingAgentEmailAddress.errorSummarySelector);

  I.see(lettingAgentEmailAddress.validationError, lettingAgentEmailAddress.errorSummarySelector);

  I.see(lettingAgentEmailAddress.validationError);
});
