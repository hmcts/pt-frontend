import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { isValidTribunalCaseReference, normaliseTribunalCaseReference } from '@utils/tribunalCaseReference';

const journeyName = 'application';
const stepName = 'tribunal-previously-determined-rent';

const caseReferenceFieldName = 'tribunalPreviouslyDeterminedRent.previousTribunalCaseReference';

/**
 * Stateless step: has the tribunal previously determined the rent for this tenancy?
 * 'Yes' reveals an optional case reference input, which is only validated when
 * 'Yes' is selected and is stored uppercased.
 */

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/tribunalPreviouslyDeterminedRent.njk`,
  showCancelButton: false,
  // Task-list status tag: 'NO' is a complete answer, so presence is enough.
  isAnswered: req => Boolean(req.session.ccdCase?.tribunalPreviouslyDeterminedRent),
  translationKeys: {
    pageTitle: 'pageTitle',
  },
  // Runs after the answers are written to the session, so the stored reference
  // is normalised rather than kept exactly as typed.
  beforeRedirect: req => {
    const stepData = req.session.formData?.[stepName];
    const caseReference = stepData?.[caseReferenceFieldName];

    if (typeof caseReference === 'string' && caseReference) {
      stepData[caseReferenceFieldName] = normaliseTribunalCaseReference(caseReference);
    }
  },
  fields: [
    {
      name: 'tribunalPreviouslyDeterminedRent',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.tribunalPreviouslyDeterminedRent.required',
      options: [
        {
          value: 'YES',
          translationKey: 'options.YES.label',
          // subFields render as a GOV.UK conditional reveal and are only validated
          // when this option is selected. Submitted as `<parent>.<subField>`.
          subFields: {
            previousTribunalCaseReference: {
              name: 'previousTribunalCaseReference',
              type: 'text',
              required: false,
              labelClasses: 'govuk-label--s',
              classes: 'govuk-input--width-20',
              translationKey: {
                label: 'previousTribunalCaseReference.label',
                hint: 'previousTribunalCaseReference.hint',
              },
              validator: (value): boolean | string => {
                if (value && !isValidTribunalCaseReference(value as string)) {
                  return 'errors.previousTribunalCaseReference.invalid';
                }
                return true;
              },
            },
          },
        },
        { value: 'NO', translationKey: 'options.NO.label' },
      ],
    },
  ],
});
