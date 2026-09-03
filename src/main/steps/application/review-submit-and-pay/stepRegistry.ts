import { step as checkYourAnswersAndSubmit } from './check-your-answers-and-submit';
import { step as checkYourAnswersHelpWithFees } from './tell-us-if-you-need-help/check-your-answers-help-with-fees';
import { step as haveYouAppliedForHelp } from './tell-us-if-you-need-help/have-you-applied-for-help';
import { step as helpWithFees } from './tell-us-if-you-need-help/help-with-fees';
import { step as youNeedToApplyForHelpWithFees } from './tell-us-if-you-need-help/you-need-to-apply-for-help-with-fees';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const reviewSubmitAndPayStepRegistry = {
  'help-with-fees': helpWithFees,
  'have-you-applied-for-help': haveYouAppliedForHelp,
  'you-need-to-apply-for-help-with-fees': youNeedToApplyForHelpWithFees,
  'check-your-answers-help-with-fees': checkYourAnswersHelpWithFees,
  'check-your-answers-and-submit': checkYourAnswersAndSubmit,
} satisfies Record<string, StepDefinition>;
