import { step as hearing } from './hearing';
import { step as propertyInspection } from './property-inspection';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const inspectionAndHearingStepRegistry = {
  'property-inspection': propertyInspection,
  hearing,
} satisfies Record<string, StepDefinition>;
