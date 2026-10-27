import { step as viewTribunalsDetermination } from './view-tribunals-determination';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const tribunalsDeterminationStepRegistry = {
  'view-tribunals-determination': viewTribunalsDetermination,
} satisfies Record<string, StepDefinition>;
