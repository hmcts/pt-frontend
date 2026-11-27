import { step as transferCase } from './transfer-case';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const relatedContentStepRegistry = {
  'transfer-case': transferCase,
} satisfies Record<string, StepDefinition>;
