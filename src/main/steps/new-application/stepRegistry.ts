import { step as applicationType } from './application-type';
import { step as tenancyType } from './tenancy-type';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const stepRegistry = {
  'application-type': applicationType,
  'tenancy-type': tenancyType,
} satisfies Record<string, StepDefinition>;

export type RespondToClaimStepName = keyof typeof stepRegistry;
