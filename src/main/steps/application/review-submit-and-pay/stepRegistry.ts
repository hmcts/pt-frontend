import { step as checkYourAnswersAndSubmit } from './check-your-answers-and-submit';
import { step as helpWithFees } from './tell-us-if-you-need-help/help-with-fees';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const reviewSubmitAndPayStepRegistry = {
  'help-with-fees': helpWithFees,
  'check-your-answers-and-submit': checkYourAnswersAndSubmit,
} satisfies Record<string, StepDefinition>;
