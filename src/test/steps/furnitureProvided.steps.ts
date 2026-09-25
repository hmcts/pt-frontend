import { furnitureProvided } from '../functional/page-data/furnitureProvided.page.data';
import { indoorFeatures } from '../functional/page-data/indoorFeatures.page.data';
import { propertyAddress } from '../functional/page-data/propertyAddress.page.data';
import { otherFacilities } from '../functional/page-data/ptOtherFacilities.page.data';
import { sharePropertyWithLandlord } from '../functional/page-data/sharePropertyWithLandlord.page.data';

const { I } = inject();

/**
10
* AC1 - Page Content
11
*/

Given('the citizen is on the Furniture Provided page', () => {
  I.click(propertyAddress.propertyDetail);
  I.waitForText(propertyAddress.pageHeading, 10);
  I.fillField('Address line 1', propertyAddress.validAddressLine1);
  I.fillField('Town or city', propertyAddress.validTownOrCity);
  I.fillField('Postcode', propertyAddress.validPostcode);
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
  I.waitForText(furnitureProvided.pageHeading, 10);
});

Then('the furniture page displays all expected content', () => {
  I.see(furnitureProvided.pageHeading);
  I.see(furnitureProvided.yesOption);
  I.see(furnitureProvided.noOption);
  I.see(furnitureProvided.saveAndContinueButton);
  I.see(furnitureProvided.saveForLaterButton);
});

/**
27
* AC2 - Conditional Reveal
28
*/

When('the citizen selects furniture Yes', () => {
  I.checkOption(furnitureProvided.yesOption);
});

When('the citizen selects furniture No', () => {
  I.checkOption(furnitureProvided.noOption);
});

Then('the furniture details textarea is displayed', () => {
  I.see(furnitureProvided.furnitureQuestion);
  I.see(furnitureProvided.furnitureHintText);
  I.seeElement(furnitureProvided.furnitureTextArea);
});

When('the citizen enters furniture details', () => {
  I.fillField(furnitureProvided.furnitureTextArea, furnitureProvided.furnitureDetails);
});

/**
52
* AC3 - Save and Continue
53
*/
When('the citizen clicks furniture Save and continue', () => {
  I.click(furnitureProvided.saveAndContinueButton);
});

Then('the citizen is navigated to the Are any services provided in your tenancy page', () => {
  I.waitForText(furnitureProvided.nextPageHeading);
});

/**
70
* AC4 - Save for Later
71
*/

When('the citizen clicks furniture Save for later', () => {
  I.click(furnitureProvided.saveForLaterButton);
});

Then('the citizen is returned to the citizen dashboard from furniture page', () => {
  I.waitForText(furnitureProvided.dashboardHeading);
});

/**
85
* AC5 - Validation Errors
86
*/

Then('the citizen sees the furniture radio button validation error', () => {
  I.see(furnitureProvided.radioButtonError, furnitureProvided.errorSummarySelector);

  I.see(furnitureProvided.radioButtonError);
});

Then('the citizen sees the furniture mandatory details validation error', () => {
  I.see(furnitureProvided.textAreaMandatoryError, furnitureProvided.errorSummarySelector);

  I.see(furnitureProvided.textAreaMandatoryError);
});

Then('the citizen sees the furniture minimum length validation error', () => {
  I.see(furnitureProvided.textAreaMinLengthError, furnitureProvided.errorSummarySelector);

  I.see(furnitureProvided.textAreaMinLengthError);
});

When('the citizen enters invalid furniture details', () => {
  I.fillField(furnitureProvided.furnitureTextArea, furnitureProvided.invalidFurnitureDetails);
});
