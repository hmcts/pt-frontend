import { indoorFeatures } from '../functional/page-data/indoorFeatures.page.data';
import { propertyAddress } from '../functional/page-data/propertyAddress.page.data';
import { otherFacilities } from '../functional/page-data/ptOtherFacilities.page.data';
import { sharePropertyWithLandlord } from '../functional/page-data/sharePropertyWithLandlord.page.data';

const { I } = inject();

Given('the citizen is on the Share Property With Landlord page', () => {
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
});

Then('the share property page displays all expected content', () => {
  I.see(sharePropertyWithLandlord.pageHeading);
  I.see(sharePropertyWithLandlord.hintText);
  I.see(sharePropertyWithLandlord.yesOption);
  I.see(sharePropertyWithLandlord.noOption);
  I.see(sharePropertyWithLandlord.saveAndContinueButton);
  I.see(sharePropertyWithLandlord.saveForLaterButton);
});

Then('the share property details textarea is displayed', () => {
  I.see(sharePropertyWithLandlord.sharePropertyQuestion);
  I.seeElement(sharePropertyWithLandlord.sharePropertyTextArea);
});

When('the citizen enters share property details', () => {
  I.fillField(sharePropertyWithLandlord.sharePropertyTextArea, sharePropertyWithLandlord.sharePropertyDetails);
});

Then('the citizen is navigated to the Upload a photo of the outside of the property page', () => {
  I.waitForText(sharePropertyWithLandlord.nextPageHeading);
});

When('the citizen enters {string} in textarea', (value: string) => {
  I.waitForElement(sharePropertyWithLandlord.sharePropertyTextArea, 30);
  I.fillField(sharePropertyWithLandlord.sharePropertyTextArea, value);
});
