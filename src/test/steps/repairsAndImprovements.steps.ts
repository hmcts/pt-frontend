import { furnitureProvided } from '../functional/page-data/furnitureProvided.page.data';
import { indoorFeatures } from '../functional/page-data/indoorFeatures.page.data';
import { propertyAddress } from '../functional/page-data/propertyAddress.page.data';
import { otherFacilities } from '../functional/page-data/ptOtherFacilities.page.data';
import { repairsAndImprovements } from '../functional/page-data/repairsAndImprovements.page.data';
import { servicesProvided } from '../functional/page-data/servicesProvided.page.data';
import { sharePropertyWithLandlord } from '../functional/page-data/sharePropertyWithLandlord.page.data';

const { I } = inject();

Given('the citizen is on the Repairs and Improvements page', () => {
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
});

Then('the repairs and improvements page displays all expected content', () => {
  I.see(repairsAndImprovements.pageHeading);
  I.see(repairsAndImprovements.guidanceText);
  I.see(repairsAndImprovements.question);
  I.see(repairsAndImprovements.yesOption);
  I.see(repairsAndImprovements.noOption);
  I.see(repairsAndImprovements.notSureOption);
  I.see(repairsAndImprovements.saveAndContinueButton);
  I.see(repairsAndImprovements.saveForLaterButton);
});

Then('the citizen is navigated to the Upload evidence of the improvements or repairs page', () => {
  I.waitForText(repairsAndImprovements.uploadEvidencePageHeading);

  I.see(repairsAndImprovements.uploadEvidencePageHeading, 'h1');
});

Then('the citizen is navigated to the Check your answers page', () => {
  I.waitForText(repairsAndImprovements.checkAnswersPageHeading);

  I.see(repairsAndImprovements.checkAnswersPageHeading, 'h1');
});
