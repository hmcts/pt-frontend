import { furnitureProvided } from '../functional/page-data/furnitureProvided.page.data';
import { indoorFeatures } from '../functional/page-data/indoorFeatures.page.data';
import { propertyAddress } from '../functional/page-data/propertyAddress.page.data';
import { otherFacilities } from '../functional/page-data/ptOtherFacilities.page.data';
import { repairsAndImprovements } from '../functional/page-data/repairsAndImprovements.page.data';
import { servicesProvided } from '../functional/page-data/servicesProvided.page.data';
import { sharePropertyWithLandlord } from '../functional/page-data/sharePropertyWithLandlord.page.data';
import { uploadEvidenceImprovementsRepairs } from '../functional/page-data/uploadEvidenceImprovementsRepairs.page.data';

const { I } = inject();

Given('the citizen is on the Upload evidence of the improvements or repairs page', () => {
  I.click(propertyAddress.propertyDetail);
  I.waitForText(propertyAddress.pageHeading, 10);
  I.fillField(propertyAddress.addressLine1, propertyAddress.validAddressLine1);
  I.fillField(propertyAddress.townOrCity, propertyAddress.validTownOrCity);
  I.fillField(propertyAddress.postcode, propertyAddress.validPostcode);
  I.click(propertyAddress.saveAndContinueButton);
  I.checkOption(indoorFeatures.terranceHouseRadioButton);
  I.click(indoorFeatures.saveAndContinueButton);
  I.checkOption(indoorFeatures.selectNoOptionOnFloorPlanProperty);
  I.click(indoorFeatures.saveAndContinueButton);
  I.waitForText(indoorFeatures.pageHeading, 10);
  I.click(indoorFeatures.saveAndContinueButton);
  I.waitForText(otherFacilities.pageHeading, 10);
  I.checkOption(otherFacilities.noOption);
  I.click(otherFacilities.saveAndContinueButton);
  I.waitForText(sharePropertyWithLandlord.pageHeading, 10);
  I.checkOption(sharePropertyWithLandlord.noOption);
  I.click(sharePropertyWithLandlord.saveAndContinueButton);
  I.click(sharePropertyWithLandlord.saveAndContinueButton);
  I.click(sharePropertyWithLandlord.saveAndContinueButton);
  I.waitForText(furnitureProvided.pageHeading, 10);
  I.checkOption(furnitureProvided.noOption);
  I.click(furnitureProvided.saveAndContinueButton);
  I.waitForText(servicesProvided.pageHeading, 10);
  I.checkOption(servicesProvided.noOption);
  I.click(servicesProvided.saveAndContinueButton);
  I.click(servicesProvided.saveAndContinueButton);
  I.click(servicesProvided.saveAndContinueButton);
  I.waitForText(repairsAndImprovements.pageHeading, 10);
  I.checkOption(repairsAndImprovements.yesOption);
  I.click(repairsAndImprovements.saveAndContinueButton);
  I.waitForText(uploadEvidenceImprovementsRepairs.pageHeading, 10);
});

Then('the upload evidence page content is displayed', () => {
  I.see(uploadEvidenceImprovementsRepairs.pageHeading);
  I.see(uploadEvidenceImprovementsRepairs.uploadLabel);
  I.see(uploadEvidenceImprovementsRepairs.saveAndContinueButton);
  I.see(uploadEvidenceImprovementsRepairs.saveForLaterButton);
});

Then('the upload component is displayed', () => {
  I.seeElement(uploadEvidenceImprovementsRepairs.uploadComponentSelector);
});

When('the citizen uploads file {string}', (fileName: string) => {
  I.attachFile(uploadEvidenceImprovementsRepairs.uploadComponentSelector, fileName);
});

Then('the uploaded file name {string} is displayed', (fileName: string) => {
  I.see(fileName);
});

Then('the citizen is redirected to Check your answers page', () => {
  I.waitForText(uploadEvidenceImprovementsRepairs.nextPageHeading, 10);
});

Then('no validation error is displayed', () => {
  I.dontSeeElement(uploadEvidenceImprovementsRepairs.errorSummarySelector);
});

Then('the file upload error {string} is displayed', (errorMessage: string) => {
  I.see(errorMessage, uploadEvidenceImprovementsRepairs.errorSummarySelector);
});
