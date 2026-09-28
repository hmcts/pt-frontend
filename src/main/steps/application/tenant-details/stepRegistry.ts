import { step as checkYourAnswersTenantDetails } from './check-your-answers-tenant-details';
import { step as yourInformation } from './your-information';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const tenantDetailsStepRegistry = {
  'your-information': yourInformation,
  'check-your-answers-tenant-details': checkYourAnswersTenantDetails,
} satisfies Record<string, StepDefinition>;
