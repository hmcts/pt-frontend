import { applicationDocumentsStepRegistry } from './application-documents/stepRegistry';
import { inspectionAndHearingStepRegistry } from './inspection-and-hearing/stepRegistry';
import { landlordDetailsStepRegistry } from './landlord-details/stepRegistry';
import { reviewSubmitAndPayStepRegistry } from './review-submit-and-pay/stepRegistry';
import { supportForHealthConditionsStepRegistry } from './support-for-health-conditions/stepRegistry';
import { step as taskList } from './task-list';
import { tenantDetailsStepRegistry } from './tenant-details/stepRegistry';
import { thePropertyStepRegistry } from './the-property/stepRegistry';
import { theRentStepRegistry } from './the-rent/stepRegistry';
import { yourApplicationStepRegistry } from './your-application/stepRegistry';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const stepRegistry = {
  'task-list': taskList,
  ...yourApplicationStepRegistry,
  ...tenantDetailsStepRegistry,
  ...landlordDetailsStepRegistry,
  ...applicationDocumentsStepRegistry,
  ...theRentStepRegistry,
  ...thePropertyStepRegistry,
  ...inspectionAndHearingStepRegistry,
  ...supportForHealthConditionsStepRegistry,
  ...reviewSubmitAndPayStepRegistry,
} satisfies Record<string, StepDefinition>;

export type ApplicationStepName = keyof typeof stepRegistry;
