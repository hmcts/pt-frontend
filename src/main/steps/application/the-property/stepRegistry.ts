import { step as propertyAddress } from './property-address';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const thePropertyStepRegistry = {
  'property-address': propertyAddress,
} satisfies Record<string, StepDefinition>;
