import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { isValidHelpWithFeesReference, normaliseHelpWithFeesReference } from '@utils/helpWithFeesReference';

const journeyName = 'application';
const stepName = 'you-need-to-apply-for-help-with-fees';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/youNeedToApplyForHelpWithFees.njk`,
  showCancelButton: false,
  isAnswered: req =>
    Boolean(req.session.ccdCase?.referenceNumber && isValidHelpWithFeesReference(req.session.ccdCase.referenceNumber)),
  beforeRedirect: req => {
    const stepData = req.session.formData?.[stepName];
    if (!stepData) {
      return;
    }

    const referenceNumber = stepData.referenceNumber;

    if (typeof referenceNumber === 'string' && referenceNumber) {
      stepData.referenceNumber = normaliseHelpWithFeesReference(referenceNumber);
    }
  },
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
    youNeedToApplyBeforeContinuing: 'youNeedToApplyBeforeContinuing',
    afterYouHaveApplied: 'afterYouHaveApplied',
  },
  fields: [
    {
      name: 'referenceNumber',
      type: 'text',
      required: true,
      maxLength: 20,
      labelClasses: 'govuk-label--s',
      classes: 'govuk-input--width-20',
      translationKey: {
        label: 'referenceNumber.label',
        hint: 'referenceNumber.hint',
      },
      errorMessage: 'errors.referenceNumber.required',
      validator: (value): boolean | string => {
        if (value && !isValidHelpWithFeesReference(value as string)) {
          return 'errors.referenceNumber.invalid';
        }
        return true;
      },
    },
  ],
});
