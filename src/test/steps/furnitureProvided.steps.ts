import { furnitureProvided } from '../functional/page-data/furnitureProvided.page.data';
import { indoorFeatures } from '../functional/page-data/indoorFeatures.page.data';
import { propertyAddress } from '../functional/page-data/propertyAddress.page.data';
import { otherFacilities } from '../functional/page-data/ptOtherFacilities.page.data';
import { sharePropertyWithLandlord } from '../functional/page-data/sharePropertyWithLandlord.page.data';

const { I } = inject();

Given('the citizen is on the Furniture Provided page', () => {
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
});

Then('the furniture page displays all expected content', () => {
  I.see(furnitureProvided.pageHeading);
  I.see(furnitureProvided.yesOption);
  I.see(furnitureProvided.noOption);
  I.see(furnitureProvided.saveAndContinueButton);
  I.see(furnitureProvided.saveForLaterButton);
});

Then('the furniture details textarea is displayed', () => {
  I.see(furnitureProvided.furnitureQuestion);
  I.see(furnitureProvided.furnitureHintText);
  I.seeElement(furnitureProvided.furnitureTextArea);
});

When('the citizen enters furniture details', () => {
  I.fillField(furnitureProvided.furnitureTextArea, furnitureProvided.furnitureDetails);
});

Then('the citizen is navigated to the Are any services provided in your tenancy page', () => {
  I.waitForText(furnitureProvided.nextPageHeading);
});

When('the citizen enters invalid furniture details', () => {
  I.fillField(furnitureProvided.furnitureTextArea, furnitureProvided.invalidFurnitureDetails);
});
