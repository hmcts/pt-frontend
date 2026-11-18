import { propertyDetailsResponse } from '../functional/page-data/propertyDetailsResponse.data';

const { I } = inject();

When('I navigate to landlord response property-address page', async () => {
  const currentUrl = await I.grabCurrentUrl();

  const caseUrn = new URL(currentUrl).pathname.split('/')[1];

  I.amOnPage(`https://pt.aat.platform.hmcts.net/${caseUrn}${propertyDetailsResponse.url}`);
});
