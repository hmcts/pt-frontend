import { landlordPhoneNumber } from '../functional/page-data/landlordPhoneNumber.page.data';
import { lettingAgentEmailAddress } from '../functional/page-data/lettingAgentEmailAddress.page.data';

const { I } = inject();

Given("the citizen is on the letting agent's email address page", () => {
  I.click(landlordPhoneNumber.landlordDetailsIncludingAnyRepresentativesLink);
  I.click(landlordPhoneNumber.saveAndContinueButton);
  I.fillField(landlordPhoneNumber.landlordEmailAddressField, landlordPhoneNumber.validEmailAddress);
  I.click(landlordPhoneNumber.saveAndContinueButton);
  I.waitForText(landlordPhoneNumber.pageHeading, 10);
  I.click(landlordPhoneNumber.saveAndContinueButton);
  I.checkOption(lettingAgentEmailAddress.lettingAgentRadioBtn);
  I.click(lettingAgentEmailAddress.saveAndContinueButton);
  I.waitForText(lettingAgentEmailAddress.pageHeading, 10);
});

When('the citizen enters a valid email address', () => {
  I.fillField(lettingAgentEmailAddress.emailField, lettingAgentEmailAddress.validEmail);
});

When('the citizen leaves the email field blank', () => {
  I.fillField(lettingAgentEmailAddress.emailField, '');
});

When('the citizen enters an invalid email address', () => {
  I.fillField(lettingAgentEmailAddress.emailField, lettingAgentEmailAddress.invalidEmail);
});

When('the citizen clicks Save and continue', () => {
  I.click(lettingAgentEmailAddress.saveAndContinueButton);
});

Then("the citizen is taken to the letting agent's phone number page", () => {
  I.waitForText(lettingAgentEmailAddress.nextPageHeading, 10);
});

Then('the email address validation error is displayed', () => {
  I.seeElement(lettingAgentEmailAddress.errorSummarySelector);

  I.see(lettingAgentEmailAddress.validationError, lettingAgentEmailAddress.errorSummarySelector);

  I.see(lettingAgentEmailAddress.validationError);
});

Then('the email validation error for empty email address is displayed', () => {
  I.seeElement(lettingAgentEmailAddress.errorSummarySelector);

  I.see(lettingAgentEmailAddress.ValidationErrorForBlankEmail, lettingAgentEmailAddress.errorSummarySelector);

  I.see(lettingAgentEmailAddress.ValidationErrorForBlankEmail);
});
