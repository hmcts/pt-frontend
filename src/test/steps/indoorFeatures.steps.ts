import { indoorFeatures } from '../functional/page-data/indoorFeatures.page.data';
import { propertyAddress } from '../functional/page-data/propertyAddress.page.data';

const { I } = inject();

/**
11
* Page Load
12
*/

Given('the citizen is on the Indoor Features page', () => {
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
});

Then('the indoor features page displays all expected content', () => {
  I.see(indoorFeatures.pageHeading);
  I.see(indoorFeatures.guidanceText);
  I.see(indoorFeatures.heatingBullet);
  I.see(indoorFeatures.doubleGlazingBullet);
  I.see(indoorFeatures.flooringBullet);
  I.see(indoorFeatures.indoorFeaturesTextArea);
  I.see(indoorFeatures.saveAndContinueButton);
  I.see(indoorFeatures.saveForLaterButton);
});

/**
34
* AC2 - Save and Continue with details
35
*/

When('the citizen enters indoor feature details', () => {
  I.fillField(indoorFeatures.indoorFeaturesTextArea, indoorFeatures.indoorFeaturesDetails);
});

When('the citizen clicks Save and continue on the Indoor Features page', () => {
  I.click(indoorFeatures.saveAndContinueButton);
});

Then('the citizen is navigated to the Does the tenancy include any other facilities page', () => {
  I.waitForText(indoorFeatures.nextPageHeading);
});

/**
55
* AC3 - Save and Continue with blank field
56
*/

When('the citizen leaves the indoor features field blank', () => {
  // Intentionally left blank
});

Then('no validation errors are displayed', () => {
  I.dontSeeElement(indoorFeatures.errorSummarySelector);
});

Then('the application accepts the empty submission', () => {
  I.waitForText(indoorFeatures.nextPageHeading);
});

Then('the citizen clicks indoor features Save for later', () => {
  I.click(indoorFeatures.saveForLaterButton);
});
