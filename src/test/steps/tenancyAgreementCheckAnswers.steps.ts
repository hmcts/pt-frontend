import { tenancyAgreementCya } from '../functional/page-data/tenancyAgreementCheckYourAnswers.page.data';
import { uploadTenancyAgreement } from '../functional/page-data/upload-tenancy-agreement.page.data';

const { I } = inject();

Given('the citizen is on the check your answers page', () => {
  I.click(uploadTenancyAgreement.tenancyAgreementLink);
  I.checkOption(uploadTenancyAgreement.copyOfTenancyAgreementRadioBtn);
  I.click(uploadTenancyAgreement.continueButton);
  I.see(uploadTenancyAgreement.pageHeading);
  I.attachFile(uploadTenancyAgreement.uploadField, uploadTenancyAgreement.validFile);
  I.click(uploadTenancyAgreement.continueButton);
  I.see(tenancyAgreementCya.pageHeading);
  I.see(tenancyAgreementCya.guidanceText);
});

Given('the citizen is on copy of tenacy agreement page', () => {
  I.click(uploadTenancyAgreement.tenancyAgreementLink);
  I.checkOption(uploadTenancyAgreement.TenancyAgreementRadioBtn);
});

Then('the page displays the caption {string}', (caption: string) => {
  I.see(caption);
});
Then('the page displays the heading {string}', (heading: string) => {
  I.see(heading, 'h1');
});
Then('the summary list contains {string}', (question: string) => {
  I.see(question);
});
Then('the answer value displayed is {string}', (answer: string) => {
  I.see(answer);
});
Then('a {string} link is displayed for each row', (linkText: string) => {
  I.see(linkText);
});
Then('the uploaded file name {string} is displayed', (fileName: string) => {
  I.see(fileName);
});
Then('the reason {string} is displayed', (reason: string) => {
  I.see(reason);
});
Then('the {string} row is not displayed', (rowText: string) => {
  I.dontSee(rowText);
});
When('the citizen selects {string} against {string}', (linkText: string, rowText: string) => {
  I.click(locate('a').withText(linkText).inside(locate('div').withText(rowText)));
});
Then('the previous answer is populated', () => {
  I.seeElement(tenancyAgreementCya.checkvalue);
});
Then('the updated answer is displayed', () => {
  I.see('No'); // Example expected updated value
});
Then('the tenancy agreement answers are saved', () => {
  I.see(tenancyAgreementCya.taskListHeading);
});
Then('the tenancy agreement answers are saved in session', () => {
  I.see(tenancyAgreementCya.taskListHeading);
});

Then('the citizen updates the answer', () => {
  I.checkOption(uploadTenancyAgreement.TenancyAgreementRadioBtn);
});
