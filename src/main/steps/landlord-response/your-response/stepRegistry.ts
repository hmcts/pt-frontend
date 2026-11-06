import { step as landlordName } from './landlord-name';
import { step as propertyAddress } from './property-address';
import { step as respondToTenantsApplication } from './respond-to-tenants-application';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const yourResponseRegistry = {
  'respond-to-tenants-application': respondToTenantsApplication,
  'property-address': propertyAddress,
  'landlord-name': landlordName,
} satisfies Record<string, StepDefinition>;
