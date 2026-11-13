import { step as anythingElse } from './anything-else';
import { step as checkYourAnswers } from './check-your-answers';
import { step as confirmationScreen } from './confirmation-screen';
import { step as declaration } from './declaration';
import { step as equalityAndDiversityQuestions } from './equality-and-diversity-questions';
import { step as extraSupport } from './extra-support';
import { step as hardship } from './hardship';
import { step as hearing } from './hearing';
import { step as inspection } from './inspection';
import { step as landlordName } from './landlord-name';
import { step as landlordType } from './landlord-type';
import { step as landlordsAddress } from './landlords-address';
import { step as propertyAddress } from './property-address';
import { step as respondToTenantsApplication } from './respond-to-tenants-application';
import { step as reviewPropertyDetails } from './review-property-details';
import { step as reviewProposedRent } from './review-proposed-rent';
import { step as reviewTenancyDetails } from './review-tenancy-details';
import { step as servedNoticeProposingNewRent } from './served-notice-proposing-new-rent';
import { step as uploadEvidencePropertyDetails } from './upload-evidence-property-details';
import { step as uploadEvidenceProposedRent } from './upload-evidence-proposed-rent';
import { step as uploadEvidenceTenancyDetails } from './upload-evidence-tenancy-details';
import { step as yourPhoneNumber } from './your-phone-number';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const yourResponseRegistry = {
  'respond-to-tenants-application': respondToTenantsApplication,
  'property-address': propertyAddress,
  'landlord-type': landlordType,
  'landlord-name': landlordName,
  'landlords-address': landlordsAddress,
  'your-phone-number': yourPhoneNumber,
  'served-notice-proposing-new-rent': servedNoticeProposingNewRent,
  'review-tenancy-details': reviewTenancyDetails,
  'upload-evidence-tenancy-details': uploadEvidenceTenancyDetails,
  'review-property-details': reviewPropertyDetails,
  'upload-evidence-property-details': uploadEvidencePropertyDetails,
  'review-proposed-rent': reviewProposedRent,
  'upload-evidence-proposed-rent': uploadEvidenceProposedRent,
  hearing,
  inspection,
  hardship,
  'extra-support': extraSupport,
  'anything-else': anythingElse,
  declaration,
  'check-your-answers': checkYourAnswers,
  'confirmation-screen': confirmationScreen,
  'equality-and-diversity-questions': equalityAndDiversityQuestions,
} satisfies Record<string, StepDefinition>;
