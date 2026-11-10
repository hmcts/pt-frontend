import { config as testConfig } from '../config';
import { landlordHousingAssociation } from '../functional/page-data/createPageIsYourLandlordHousingAssociationTriageQuestions.data';

const { I } = inject();
const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

Given('I am on the landlord housing association page', () => {
  I.amOnPage(ptUrl(landlordHousingAssociation.landingHousingAssociationUrl));
});
