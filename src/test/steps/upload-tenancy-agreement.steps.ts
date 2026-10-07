import { uploadTenancyAgreement } from '../functional/page-data/upload-tenancy-agreement.page.data';

const { I } = inject();

Given('the citizen is on the Upload tenancy agreement page', () => {
  I.click(uploadTenancyAgreement.tenancyAgreementLink);
  I.checkOption(uploadTenancyAgreement.copyOfTenancyAgreementRadioBtn);
  I.click(uploadTenancyAgreement.continueButton);
  I.see(uploadTenancyAgreement.pageHeading);
});

When('the page displays the heading {string}', (heading: string) => {
  I.see(heading);
});

Then('the file upload component is displayed', () => {
  I.seeElement(uploadTenancyAgreement.uploadField);
});

When('the page displays {string} button', (buttonText: string) => {
  I.see(buttonText);
});

When('the citizen uploads a valid tenancy agreement file', () => {
  I.attachFile(uploadTenancyAgreement.uploadField, uploadTenancyAgreement.validFile);
});

Then('the uploaded file name is displayed', () => {
  I.see('tenancy-agreement.pdf');
});

Given('the citizen has uploaded a empty tenancy agreement file', () => {
  I.attachFile(uploadTenancyAgreement.uploadField, uploadTenancyAgreement.emptyFile);
});

Given('the citizen has uploaded unsuppprted file', () => {
  I.attachFile(uploadTenancyAgreement.uploadField, uploadTenancyAgreement.unsupportedFile);
});

Then('the citizen is taken to the Check your answers page', () => {
  I.waitInUrl('/check-your-answers', 10);
});

When('the citizen uploads an invalid file type', () => {
  I.attachFile(uploadTenancyAgreement.uploadField, uploadTenancyAgreement.invalidFile);
});

When('the citizen has uploaded a valid tenancy agreement file', () => {
  I.attachFile(uploadTenancyAgreement.uploadField, uploadTenancyAgreement.validFile);
});
