import { step as landlordName } from './landlord-name';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const landlordDetailsStepRegistry = {
  'landlord-name': landlordName,
} satisfies Record<string, StepDefinition>;
