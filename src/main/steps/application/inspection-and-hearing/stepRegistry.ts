import { step as propertyInspection } from './property-inspection';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const inspectionAndHearingStepRegistry = {
  'property-inspection': propertyInspection,
} satisfies Record<string, StepDefinition>;
