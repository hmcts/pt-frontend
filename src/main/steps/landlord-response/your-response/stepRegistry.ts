import { step as propertyAddress } from './property-address';
import { step as respondToTenantsApplication } from './respond-to-tenants-application';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const yourResponseRegistry = {
  'respond-to-tenants-application': respondToTenantsApplication,
  'property-address': propertyAddress,
} satisfies Record<string, StepDefinition>;
