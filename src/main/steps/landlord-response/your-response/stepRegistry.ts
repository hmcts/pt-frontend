import { step as landlordName } from './landlord-name';
import { step as propertyAddress } from './property-address';
import { step as respondToTenantsApplication } from './respond-to-tenants-application';
import { step as reviewTenancyDetails } from './review-tenancy-details';
import { step as servedNoticeProposingNewRent } from './served-notice-proposing-new-rent';
import { step as yourPhoneNumber } from './your-phone-number';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const yourResponseRegistry = {
  'respond-to-tenants-application': respondToTenantsApplication,
  'property-address': propertyAddress,
  'landlord-name': landlordName,
  'your-phone-number': yourPhoneNumber,
  'served-notice-proposing-new-rent': servedNoticeProposingNewRent,
  'review-tenancy-details': reviewTenancyDetails,
} satisfies Record<string, StepDefinition>;
