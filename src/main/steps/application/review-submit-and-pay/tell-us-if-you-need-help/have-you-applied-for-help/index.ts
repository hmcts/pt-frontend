import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { CcdCaseData } from '@services/ccdCase.interface';
import { isValidHelpWithFeesReference, normaliseHelpWithFeesReference } from '@utils/helpWithFeesReference';

const journeyName = 'application';
const stepName = 'have-you-applied-for-help';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/haveYouAppliedForHelp.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  beforeRedirect: req => {
    const stepData = req.session.formData?.[stepName];
    if (!stepData) {
      return;
    }

    const referenceNumberFieldName = 'appliedForHelpWithFees.referenceNumber';

    if (stepData.appliedForHelpWithFees !== 'Yes') {
      delete stepData[referenceNumberFieldName];
      return;
    }

    const referenceNumber = stepData[referenceNumberFieldName];

    if (typeof referenceNumber === 'string' && referenceNumber) {
      stepData[referenceNumberFieldName] = normaliseHelpWithFeesReference(referenceNumber);
    }
  },
  fields: [
    {
      name: 'appliedForHelpWithFees',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: 'errors.appliedForHelpWithFees.required',
      options: [
        {
          value: 'Yes',
          translationKey: 'common:yes',
          subFields: {
            referenceNumber: {
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
          },
        },
        { value: 'No', translationKey: 'common:no' },
      ],
    },
  ],
});

function isAnswered(ccdCase?: CcdCaseData): boolean {
  if (!ccdCase?.appliedForHelpWithFees) {
    return false;
  }

  if (ccdCase.appliedForHelpWithFees === 'YES') {
    return Boolean(ccdCase.referenceNumber && isValidHelpWithFeesReference(ccdCase.referenceNumber));
  }

  return ccdCase.appliedForHelpWithFees === 'NO';
}
