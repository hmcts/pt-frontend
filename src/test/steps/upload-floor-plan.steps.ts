import { indoorFeatures } from '../functional/page-data/indoorFeatures.page.data';
import { propertyAddress } from '../functional/page-data/propertyAddress.page.data';
import { uploadFloorPlan } from '../functional/page-data/upload-floor-plan.page.data';

const { I } = inject();

Given('the citizen is on the Upload floor plan page', () => {
  I.click(propertyAddress.propertyDetail);
  I.waitForText(propertyAddress.pageHeading, 10);
  I.fillField(propertyAddress.addressLine1, propertyAddress.validAddressLine1);
  I.fillField(propertyAddress.townOrCity, propertyAddress.validTownOrCity);
  I.fillField(propertyAddress.postcode, propertyAddress.validPostcode);
  I.click(propertyAddress.saveAndContinueButton);
  I.checkOption(indoorFeatures.terranceHouseRadioButton);
  I.click(indoorFeatures.saveAndContinueButton);
  I.checkOption(indoorFeatures.selectYesOptionOnFloorPlanProperty);
  I.click(indoorFeatures.saveAndContinueButton);
  I.see(uploadFloorPlan.pageHeading);
});

Then('the page displays the heading {string}', (heading: string) => {
  I.see(heading);
});

Then('the hint text {string} is displayed', (text: string) => {
  I.see(text);
});

Then('the upload component is displayed', () => {
  I.see('Upload a file');
  I.see('Choose file');
  I.see('or drop file');
});

Then('the buttons {string} and {string} are displayed', (button1: string, button2: string) => {
  I.see(button1);
  I.see(button2);
});

When('the citizen uploads a valid floor plan file', () => {
  I.attachFile(uploadFloorPlan.uploadField, uploadFloorPlan.validFile);
});

Then('the selected file name is displayed', () => {
  I.see('floor-plan.pdf');
});

When('the citizen clicks {string}', (button: string) => {
  I.click(button);
});

Then('the file is uploaded successfully', () => {
  I.dontSee('There is a problem');
});

Then('the citizen is redirected to the {string} page', (pageHeading: string) => {
  I.see(pageHeading);
});

Then('the selected file is saved in session', () => {
  I.dontSee('There is a problem');
});

Then('the citizen is redirected to the citizen dashboard', () => {
  I.see('Your applications');
});

When('the citizen uploads {string}', (fileType: string) => {
  switch (fileType) {
    case 'empty-file':
      I.attachFile(uploadFloorPlan.uploadField, uploadFloorPlan.emptyFile);
      break;

    case 'unsupported-file':
      I.attachFile(uploadFloorPlan.uploadField, uploadFloorPlan.unsupportedFile);
      break;

    case 'oversized-file':
      I.attachFile(uploadFloorPlan.uploadField, uploadFloorPlan.oversizedFile);
      break;

    case 'virus-file':
      I.attachFile(uploadFloorPlan.uploadField, uploadFloorPlan.virusFile);
      break;

    case 'password-file':
      I.attachFile(uploadFloorPlan.uploadField, uploadFloorPlan.passwordProtectedFile);
      break;

    case 'no-file':
      break;
  }
});

Then('the error message {string} is displayed', (errorMessage: string) => {
  I.seeElement('.govuk-error-summary');
  I.see(errorMessage);
});

Then('the citizen remains on the Upload floor plan page', () => {
  I.see(uploadFloorPlan.pageHeading);
});
