import { landlordLettingAgentInformation } from '../functional/page-data/landlordLettingAgentInformation.data';

const { I } = inject();

Given("I am  on the letting agent's email address page", () => {
  I.click(landlordLettingAgentInformation.landlordDetailsIncludingAnyRepresentativesLink);
  I.click(landlordLettingAgentInformation.saveAndContinueButton);
  I.fillField(
    landlordLettingAgentInformation.landlordEmailAddressField,
    landlordLettingAgentInformation.validEmailAddress
  );
  I.click(landlordLettingAgentInformation.saveAndContinueButton);
  I.waitForText(landlordLettingAgentInformation.landLordPhoneNumberHeading, 10);
  I.click(landlordLettingAgentInformation.saveAndContinueButton);
  I.checkOption(landlordLettingAgentInformation.lettingAgentRadioBtn);
  I.click(landlordLettingAgentInformation.saveAndContinueButton);
  I.waitForText(landlordLettingAgentInformation.LandLordLettingAgentEmailAddresspageHeading, 10);
});

Given("I am on the letting agent's phone number page", () => {
  I.click(landlordLettingAgentInformation.landlordDetailsIncludingAnyRepresentativesLink);
  I.click(landlordLettingAgentInformation.saveAndContinueButton);
  I.fillField(
    landlordLettingAgentInformation.landlordEmailAddressField,
    landlordLettingAgentInformation.validEmailAddress
  );
  I.click(landlordLettingAgentInformation.saveAndContinueButton);
  I.waitForText(landlordLettingAgentInformation.landLordPhoneNumberHeading, 10);
  I.click(landlordLettingAgentInformation.saveAndContinueButton);
  I.checkOption(landlordLettingAgentInformation.lettingAgentRadioBtn);
  I.click(landlordLettingAgentInformation.saveAndContinueButton);
  I.waitForText(landlordLettingAgentInformation.LandLordLettingAgentEmailAddresspageHeading, 10);
  I.fillField(landlordLettingAgentInformation.emailField, landlordLettingAgentInformation.validEmail);
  I.click(landlordLettingAgentInformation.saveAndContinueButton);
  I.waitForText(landlordLettingAgentInformation.LandLoradLettingAgentphoneNumberPageHeading, 10);
});

When('I enters a valid email address', () => {
  I.fillField(landlordLettingAgentInformation.emailField, landlordLettingAgentInformation.validEmail);
});

When('I leaves the email field blank', () => {
  I.fillField(landlordLettingAgentInformation.emailField, '');
});

When('I enters an invalid email address', () => {
  I.fillField(landlordLettingAgentInformation.emailField, landlordLettingAgentInformation.invalidEmail);
});

When('I enter {string} in the phone number field', (phoneNumber: string) => {
  I.fillField(landlordLettingAgentInformation.lettingAgentphoneNumberField, phoneNumber);
});

Then('I redirected to {string}', (page: string) => {
  I.waitForText(page, 10);
  I.see(page, 'h1');
});
