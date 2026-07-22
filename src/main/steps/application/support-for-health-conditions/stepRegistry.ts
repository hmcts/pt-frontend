import { step as extraSupport } from './extra-support';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const supportForHealthConditionsStepRegistry = {
  'extra-support': extraSupport,
} satisfies Record<string, StepDefinition>;
