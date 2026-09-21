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

Given('the citizen is on the Share Property With Landlord page', () => {
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
});

Then('the share property page displays all expected content', () => {
  I.see(sharePropertyWithLandlord.pageHeading);
  I.see(sharePropertyWithLandlord.hintText);
  I.see(sharePropertyWithLandlord.yesOption);
  I.see(sharePropertyWithLandlord.noOption);
  I.see(sharePropertyWithLandlord.saveAndContinueButton);
  I.see(sharePropertyWithLandlord.saveForLaterButton);
});

/**
28
* AC2 - Conditional Reveal
29
*/

When('the citizen selects share property Yes', () => {
  I.checkOption(sharePropertyWithLandlord.yesOption);
});

When('the citizen selects share property No', () => {
  I.checkOption(sharePropertyWithLandlord.noOption);
});

Then('the share property details textarea is displayed', () => {
  I.see(sharePropertyWithLandlord.sharePropertyQuestion);
  I.seeElement(sharePropertyWithLandlord.sharePropertyTextArea);
});

When('the citizen enters share property details', () => {
  I.fillField(sharePropertyWithLandlord.sharePropertyTextArea, sharePropertyWithLandlord.sharePropertyDetails);
});

/**
52
* AC3 - Save and Continue
53
*/

When('the citizen clicks share property Save and continue', () => {
  I.click(sharePropertyWithLandlord.saveAndContinueButton);
});

Then('the citizen is navigated to the Upload a photo of the outside of the property page', () => {
  I.waitForText(sharePropertyWithLandlord.nextPageHeading);
});

/**
70
* AC4 - Save for Later
71
*/

When('the citizen clicks share property Save for later', () => {
  I.click(sharePropertyWithLandlord.saveForLaterButton);
});

/**
85
* AC5 - Validation Errors
86
*/

Then('the citizen sees the share property radio button validation error', () => {
  I.see(sharePropertyWithLandlord.radioButtonError, sharePropertyWithLandlord.errorSummarySelector);

  I.see(sharePropertyWithLandlord.radioButtonError);
});

Then('the citizen sees the share property mandatory details validation error', () => {
  I.see(sharePropertyWithLandlord.textAreaMandatoryError, sharePropertyWithLandlord.errorSummarySelector);

  I.see(sharePropertyWithLandlord.textAreaMandatoryError);
});

When('the citizen enters {string} in textarea', (value: string) => {
  I.waitForElement(sharePropertyWithLandlord.sharePropertyTextArea, 30);
  I.fillField(sharePropertyWithLandlord.sharePropertyTextArea, value);
});
