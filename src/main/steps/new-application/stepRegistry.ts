import { step as applicationType } from './application-type';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const stepRegistry = {
  'application-type': applicationType,
} satisfies Record<string, StepDefinition>;

export type RespondToClaimStepName = keyof typeof stepRegistry;
