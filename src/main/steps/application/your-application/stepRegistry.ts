import { step as applicationType } from './application-type';
import { step as cyaContactPreferences } from './contact-preferences/check-your-answers-contact-preferences';
import { step as contactByPhone } from './contact-preferences/contact-by-phone';
import { step as textUpdates } from './contact-preferences/text-updates';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const yourApplicationStepRegistry = {
  'application-type': applicationType,
  'text-updates': textUpdates,
  'contact-by-phone': contactByPhone,
  'check-your-answers-contact-preferences': cyaContactPreferences,
} satisfies Record<string, StepDefinition>;
