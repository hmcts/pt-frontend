import { config as testConfig } from '../config';
import { landlordHousingAssociation } from '../functional/page-data/ptLandlordHousingAssociation.page.data';

const { I } = inject();

const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

Given('I have selected Housing association as my landlord', () => {
  I.amOnPage(
    ptUrl('https://pt-frontend-pr-146.preview.platform.hmcts.net/pre-application/landlord-is-a-housing-association')
  );

  I.waitForText(landlordHousingAssociation.pageHeading);
  I.click(landlordHousingAssociation.yesOption);
  I.click(landlordHousingAssociation.continueButton);
});
