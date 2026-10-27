import { step as taskList } from './task-list';
import { tenantsApplicationStepRegistry } from './tenants-application/stepRegistry';
import { yourResponseRegistry } from './your-response/stepRegistry';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const stepRegistry = {
  'task-list': taskList,
  ...tenantsApplicationStepRegistry,
  ...yourResponseRegistry,
} satisfies Record<string, StepDefinition>;

export type LandlordResponseStepName = keyof typeof stepRegistry;
