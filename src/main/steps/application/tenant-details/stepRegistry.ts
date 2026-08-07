import { step as yourInformation } from './your-information';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const tenantDetailsStepRegistry = {
  'your-information': yourInformation,
} satisfies Record<string, StepDefinition>;
