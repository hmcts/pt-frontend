import { step as viewTenantsApplication } from './view-tenants-application';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const tenantsApplicationStepRegistry = {
  'view-tenants-application': viewTenantsApplication,
} satisfies Record<string, StepDefinition>;
