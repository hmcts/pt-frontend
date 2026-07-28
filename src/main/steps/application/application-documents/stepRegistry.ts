import { step as haveLandlordsNotice } from './landlords-notice/have-landlords-notice';
import { step as haveTenancyAgreement } from './your-tenancy-agreement/have-tenancy-agreement';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const applicationDocumentsStepRegistry = {
  'have-landlords-notice': haveLandlordsNotice,
  'have-tenancy-agreement': haveTenancyAgreement,
} satisfies Record<string, StepDefinition>;
