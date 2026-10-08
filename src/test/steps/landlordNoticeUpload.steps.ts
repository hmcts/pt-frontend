import { landlordNoticeUpload } from '../functional/page-data/landlordNoticeUpload.page.data';

const { I } = inject();

Given('the citizen is on the Landlord Notice Upload page', () => {
  I.waitForText(landlordNoticeUpload.pageHeading, 10);
});

Then('the landlord notice upload page content is displayed', () => {
  I.see(landlordNoticeUpload.pageHeading);
  I.see(landlordNoticeUpload.yesOption);
  I.see(landlordNoticeUpload.noOption);
  I.see(landlordNoticeUpload.saveAndContinueButton);
  I.see(landlordNoticeUpload.saveForLaterButton);
});

When('the citizen selects No option', () => {
  I.checkOption(landlordNoticeUpload.noOption);
});

Then('the reason text area is displayed', () => {
  I.see(landlordNoticeUpload.reasonLabel);
});

When('the citizen selects Yes option', () => {
  I.checkOption(landlordNoticeUpload.yesOption);
});

When('the citizen enters notice upload reason {string}', (reason: string) => {
  I.fillField(landlordNoticeUpload.reasonLabel, reason);
});

Then('the citizen is redirected to Upload your notice proposing a new rent page', () => {
  I.waitForText(landlordNoticeUpload.uploadPageHeading, 10);
});

Then('the citizen is redirected to Your notice proposing a new rent page', () => {
  I.waitForText(landlordNoticeUpload.legalValidityPageHeading, 10);
});

Then('the error message {string} is displayed', (errorMessage: string) => {
  I.see(errorMessage, landlordNoticeUpload.errorSummarySelector);
});
