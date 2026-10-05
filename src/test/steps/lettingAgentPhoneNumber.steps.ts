import { landlordPhoneNumber } from '../functional/page-data/landlordPhoneNumber.page.data';
import { lettingAgentEmailAddress } from '../functional/page-data/lettingAgentEmailAddress.page.data';
import { lettingAgentPhoneNumber } from '../functional/page-data/lettingAgentPhoneNumber.page.data';

const { I } = inject();

Given("the citizen is on the letting agent's phone number page", () => {
  I.click(landlordPhoneNumber.landlordDetailsIncludingAnyRepresentativesLink);
  I.click(landlordPhoneNumber.saveAndContinueButton);
  I.fillField(landlordPhoneNumber.landlordEmailAddressField, landlordPhoneNumber.validEmailAddress);
  I.click(landlordPhoneNumber.saveAndContinueButton);
  I.waitForText(landlordPhoneNumber.pageHeading, 10);
  I.click(landlordPhoneNumber.saveAndContinueButton);
  I.checkOption(lettingAgentEmailAddress.lettingAgentRadioBtn);
  I.click(lettingAgentEmailAddress.saveAndContinueButton);
  I.waitForText(lettingAgentEmailAddress.pageHeading, 10);
  I.fillField(lettingAgentEmailAddress.emailField, lettingAgentEmailAddress.validEmail);
  I.click(lettingAgentEmailAddress.saveAndContinueButton);
  I.waitForText(lettingAgentPhoneNumber.pageHeading, 10);
});

When('the citizen enters {string} in the phone number field', (phoneNumber: string) => {
  I.fillField(lettingAgentPhoneNumber.phoneNumberField, phoneNumber);
});

When('the citizen clicks save and continue', () => {
  I.click('Save and continue');
});

Then('the citizen is redirected to {string}', (page: string) => {
  I.waitForText(page, 10);
  I.see(page, 'h1');
});
