import { step as applicationType } from './application-type';
import { step as contactPreferences } from './contact-preferences/contact-preferences';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const yourApplicationStepRegistry = {
  'application-type': applicationType,
  'contact-preferences': contactPreferences,
} satisfies Record<string, StepDefinition>;
