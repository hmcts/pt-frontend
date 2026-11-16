import { step as checkYourAnswersExtraSupport } from './check-your-answers-extra-support';
import { step as extraSupport } from './extra-support';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const supportForHealthConditionsStepRegistry = {
  'extra-support': extraSupport,
  'check-your-answers-extra-support': checkYourAnswersExtraSupport,
} satisfies Record<string, StepDefinition>;
