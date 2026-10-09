import { propertyDetails } from '../functional/page-data/propertyDetails.page.data';

const { I } = inject();

Then('check that the user is redirected to the property-details page', () => {
  I.waitInUrl(propertyDetails.propertyDetailsUrl);
  I.waitForText(propertyDetails.propertyDetailsHeading);
});

When('I enter first line of address as {string}', (addressLine1: string) => {
  I.fillField('Address line 1', addressLine1);
});

When('I enter second line of address as {string}', (addressLine2: string) => {
  I.fillField('Address line 2 (optional)', addressLine2);
});

When('I enter town or city as {string}', (townOrCity: string) => {
  I.fillField('Town or city', townOrCity);
});

When('I enter postcode as {string}', (postcode: string) => {
  I.fillField('Postcode', postcode);
});

When('I enter room sizes as {string} for the question {string}', (roomSizes: string, question: string) => {
  I.fillField(question, roomSizes);
});
