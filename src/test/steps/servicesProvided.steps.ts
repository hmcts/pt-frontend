import { furnitureProvided } from '../functional/page-data/furnitureProvided.page.data';
import { indoorFeatures } from '../functional/page-data/indoorFeatures.page.data';
import { propertyAddress } from '../functional/page-data/propertyAddress.page.data';
import { otherFacilities } from '../functional/page-data/ptOtherFacilities.page.data';
import { servicesProvided } from '../functional/page-data/servicesProvided.page.data';
import { sharePropertyWithLandlord } from '../functional/page-data/sharePropertyWithLandlord.page.data';

const { I } = inject();

/**
10
* AC1 - Page Content
11
*/

Given('the citizen is on the Services Provided page', () => {
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
  I.checkOption(furnitureProvided.noOption);
  I.click(furnitureProvided.saveAndContinueButton);
  I.waitForText(servicesProvided.pageHeading, 10);
});

Then('the services page displays all expected content', () => {
  I.see(servicesProvided.pageHeading);
  I.see(servicesProvided.hintText);
  I.see(servicesProvided.yesOption);
  I.see(servicesProvided.noOption);
  I.see(servicesProvided.saveAndContinueButton);
  I.see(servicesProvided.saveForLaterButton);
});

/**
28
* AC2 - Conditional Reveal
29
*/

When('the citizen selects services Yes', () => {
  I.checkOption(servicesProvided.yesOption);
});

When('the citizen selects services No', () => {
  I.checkOption(servicesProvided.noOption);
});

Then('the services details textarea is displayed', () => {
  I.see(servicesProvided.servicesQuestion);
  I.seeElement(servicesProvided.servicesTextArea);
});

When('the citizen enters services details', () => {
  I.fillField(servicesProvided.servicesTextArea, servicesProvided.servicesDetails);
});

When('the citizen enters invalid services details', () => {
  I.fillField(servicesProvided.servicesTextArea, servicesProvided.invalidServicesDetails);
});

/**
59
* AC3 - Save and Continue
60
*/

When('the citizen clicks services Save and continue', () => {
  I.click(servicesProvided.saveAndContinueButton);
});

Then('the citizen is navigated to the What repairs are the landlord responsibility page', () => {
  I.waitForText(servicesProvided.nextPageHeading);
});

/**
77
* AC4 - Save for Later
78
*/

When('the citizen clicks services Save for later', () => {
  I.click(servicesProvided.saveForLaterButton);
});

Then('the citizen is returned to the citizen dashboard from services page', () => {
  I.waitForText(servicesProvided.dashboardHeading);
});

/**
92
* AC5 - Validation Errors
93
*/

Then('the citizen sees the services radio button validation error', () => {
  I.see(servicesProvided.radioButtonError, servicesProvided.errorSummarySelector);

  I.see(servicesProvided.radioButtonError);
});

Then('the citizen sees the services mandatory details validation error', () => {
  I.see(servicesProvided.textAreaMandatoryError, servicesProvided.errorSummarySelector);

  I.see(servicesProvided.textAreaMandatoryError);
});

Then('the citizen sees the services minimum length validation error', () => {
  I.see(servicesProvided.textAreaMinLengthError, servicesProvided.errorSummarySelector);

  I.see(servicesProvided.textAreaMinLengthError);
});
