import { indoorFeatures } from '../functional/page-data/indoorFeatures.page.data';
import { propertyAddress } from '../functional/page-data/propertyAddress.page.data';
import { otherFacilities } from '../functional/page-data/ptOtherFacilities.page.data';

const { I } = inject();

/**
10
* AC1 - Page Content
11
*/

Given('the citizen is on the Other Facilities page', () => {
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
});

Then('the page displays all expected content', () => {
  I.see(otherFacilities.pageHeading, 'h1');
  I.see(otherFacilities.hintText);
  I.see(otherFacilities.yesOption);
  I.see(otherFacilities.noOption);
  I.see(otherFacilities.saveAndContinueButton);
  I.see(otherFacilities.saveForLaterButton);
});

/**
28
* AC2 - Conditional Reveal
29
*/

When('the citizen selects the Yes radio button', () => {
  I.checkOption(otherFacilities.yesOption);
});

When('the citizen selects the No radio button', () => {
  I.checkOption(otherFacilities.noOption);
});

Then('the What other facilities does your tenancy include text area is displayed', () => {
  I.see(otherFacilities.otherFacilitiesQuestion);
  I.seeElement(otherFacilities.otherFacilitiesTextArea);
});

When('the citizen enters facilities details', () => {
  I.fillField(otherFacilities.otherFacilitiesTextArea, otherFacilities.facilitiesDetails);
});

/**
55
* AC3 - Save and Continue
56
*/

When('the citizen clicks Save and continue', () => {
  I.click(otherFacilities.saveAndContinueButton);
});

Then('the citizen is navigated to the Do you share the property with the landlord page', () => {
  I.waitForText(otherFacilities.nextPageHeading, 10);
});

/**
70
* AC4 - Save for Later
71
*/
When('the citizen clicks Save for later', () => {
  I.click(otherFacilities.saveForLaterButton);
});

/**
82
* AC5 - Validation Errors
83
*/

Then('the citizen sees the tenancy facilities radio button validation error', () => {
  I.see(otherFacilities.radioButtonError, otherFacilities.errorSummarySelector);

  I.see(otherFacilities.radioButtonError);
});

Then('the citizen sees the tenancy facilities details validation error', () => {
  I.see(otherFacilities.textAreaError, otherFacilities.errorSummarySelector);

  I.see(otherFacilities.textAreaError);
});
