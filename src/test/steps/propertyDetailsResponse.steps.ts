import { config as testConfig } from '../config';
import { propertyDetailsResponse } from '../functional/page-data/propertyDetailsResponse.data';
const { I } = inject();
const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

When('I navigate to landlord response property-address page', async () => {
  const currentUrl = await I.grabCurrentUrl();
  const caseUrn = new URL(currentUrl).pathname.split('/')[1];
  const targetUrl = ptUrl(`${caseUrn}${propertyDetailsResponse.url}`);
  I.amOnPage(targetUrl);
});
