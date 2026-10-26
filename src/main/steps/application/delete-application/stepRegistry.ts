import { step as deleteApplicationConfirmation } from './delete-application-confirmation';
import { step as deleteApplicationSuccess } from './delete-application-success';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const deleteApplicationStepRegistry = {
  'delete-application-confirmation': deleteApplicationConfirmation,
  'delete-application-success': deleteApplicationSuccess,
} satisfies Record<string, StepDefinition>;
