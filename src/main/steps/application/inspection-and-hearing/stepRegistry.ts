import { step as checkYourAnswersInspectionAndHearing } from './check-your-answers-inspection-and-hearing';
import { step as hearing } from './hearing';
import { step as propertyInspection } from './property-inspection';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const inspectionAndHearingStepRegistry = {
  'property-inspection': propertyInspection,
  hearing,
  'check-your-answers-inspection-and-hearing': checkYourAnswersInspectionAndHearing,
} satisfies Record<string, StepDefinition>;
