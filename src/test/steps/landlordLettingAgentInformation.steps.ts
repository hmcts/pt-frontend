import { landlordLettingAgentInformation } from '../functional/page-data/landlordLettingAgentInformation.data';

const { I } = inject();

const { saveAndContinueButton: saveAndContinue } = landlordLettingAgentInformation;

const goToLettingAgentEmailPage = (): void => {
  I.click(landlordLettingAgentInformation.landlordDetailsIncludingAnyRepresentativesLink);
  I.checkOption(landlordLettingAgentInformation.landlordIndividualOption);
  I.fillField(
    landlordLettingAgentInformation.landlordFirstNameField,
    landlordLettingAgentInformation.landlordFirstName
  );
  I.fillField(landlordLettingAgentInformation.landlordLastNameField, landlordLettingAgentInformation.landlordLastName);
  I.click(saveAndContinue);
  I.click(saveAndContinue);
  I.fillField(
    landlordLettingAgentInformation.landlordEmailAddressField,
    landlordLettingAgentInformation.validEmailAddress
  );
  I.click(saveAndContinue);
  I.waitForText(landlordLettingAgentInformation.landLordPhoneNumberHeading, 10);
  I.click(saveAndContinue);
  I.checkOption(landlordLettingAgentInformation.lettingAgentRadioBtn);
  I.click(saveAndContinue);
  I.waitForText(landlordLettingAgentInformation.LandLordLettingAgentEmailAddresspageHeading, 10);
};

Given("I am  on the letting agent's email address page", goToLettingAgentEmailPage);

Given("I am on the letting agent's phone number page", () => {
  goToLettingAgentEmailPage();
  I.fillField(landlordLettingAgentInformation.emailField, landlordLettingAgentInformation.validEmail);
  I.click(saveAndContinue);
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
