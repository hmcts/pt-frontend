import { furnitureProvided } from '../functional/page-data/furnitureProvided.page.data';
import { indoorFeatures } from '../functional/page-data/indoorFeatures.page.data';
import { landlordRepairs } from '../functional/page-data/landlordRepairs.page.data';
import { propertyAddress } from '../functional/page-data/propertyAddress.page.data';
import { otherFacilities } from '../functional/page-data/ptOtherFacilities.page.data';
import { servicesProvided } from '../functional/page-data/servicesProvided.page.data';
import { sharePropertyWithLandlord } from '../functional/page-data/sharePropertyWithLandlord.page.data';

const { I } = inject();

/**
7
* AC1 - Page Content
8
*/

Given('the citizen is on the Landlord Repairs page', () => {
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
  I.checkOption(servicesProvided.noOption);
  I.click(servicesProvided.saveAndContinueButton);
  I.waitForText(landlordRepairs.pageHeading, 10);
});

Then('the landlord repairs page displays all expected content', () => {
  I.see(landlordRepairs.pageHeading);
  I.see(landlordRepairs.hintText);
  I.seeElement(landlordRepairs.textArea);
  I.see(landlordRepairs.saveAndContinueButton);
  I.see(landlordRepairs.saveForLaterButton);
});

/**
31
* AC2 - Save and Continue with Details
32
*/
When('the citizen enters landlord repair details', () => {
  I.fillField(landlordRepairs.textArea, landlordRepairs.repairDetails);
  I.click(landlordRepairs.saveAndContinueButton);
});

Then('check that the user is redirected to the "tenant-repairs-responsibility" page', () => {
  I.waitForText(landlordRepairs.repairTenentResposibilityHeading);
});

/**
50
* AC3 - Save and Continue with Blank Field
51
*/
Then('no validation message is displayed', () => {
  I.click(landlordRepairs.saveAndContinueButton);
  I.dontSee('There is a problem');
  I.dontSeeElement('.govuk-error-summary');
  I.dontSeeElement('.govuk-error-message');
});
