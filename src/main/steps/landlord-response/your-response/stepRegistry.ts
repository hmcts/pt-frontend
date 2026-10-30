import { step as respondToTenantsApplication } from './respond-to-tenants-application';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const yourResponseRegistry = {
  'respond-to-tenants-application': respondToTenantsApplication,
} satisfies Record<string, StepDefinition>;
