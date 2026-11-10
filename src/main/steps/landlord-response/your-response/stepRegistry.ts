import { step as propertyAddress } from './property-address';
import { step as respondToTenantsApplication } from './respond-to-tenants-application';
import { step as reviewPropertyDetails } from './review-property-details';
import { step as reviewTenancyDetails } from './review-tenancy-details';
import { step as servedNoticeProposingNewRent } from './served-notice-proposing-new-rent';
import { step as uploadEvidenceTenancyDetails } from './upload-evidence-tenancy-details';
import { step as yourPhoneNumber } from './your-phone-number';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const yourResponseRegistry = {
  'respond-to-tenants-application': respondToTenantsApplication,
  'property-address': propertyAddress,
  'your-phone-number': yourPhoneNumber,
  'served-notice-proposing-new-rent': servedNoticeProposingNewRent,
  'review-tenancy-details': reviewTenancyDetails,
  'upload-evidence-tenancy-details': uploadEvidenceTenancyDetails,
  'review-property-details': reviewPropertyDetails,
} satisfies Record<string, StepDefinition>;
