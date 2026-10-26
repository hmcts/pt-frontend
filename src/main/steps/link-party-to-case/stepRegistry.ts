import { step as enterAccessCode } from './enter-access-code';
import { step as success } from './success';

import { StepDefinition } from '@modules/steps/stepFormData.interface';

export const stepRegistry = {
  'enter-access-code': enterAccessCode,
  success,
} satisfies Record<string, StepDefinition>;

export type LinkPartyToCaseStepName = keyof typeof stepRegistry;
