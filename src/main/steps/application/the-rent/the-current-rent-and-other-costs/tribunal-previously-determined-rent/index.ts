import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { isValidTribunalCaseReference, normaliseTribunalCaseReference } from '@utils/tribunalCaseReference';

const journeyName = 'application';
const stepName = 'tribunal-previously-determined-rent';

const caseReferenceFieldName = 'tribunalPreviouslyDeterminedTenancyRent.previousTribunalCaseReference';

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
  // Task-list status tag: 'No' is a complete answer, so presence is enough.
  isAnswered: req => Boolean(req.session.ccdCase?.currentRentsDetails?.tribunalPreviouslyDeterminedTenancyRent),

  // Runs after the answers are written to the session. Normalises the stored
  // reference, and drops it if the answer is not 'Yes' setFormData currently
  // replaces the step's data on each POST, but it
  // keeps the step correct regardless of that behaviour.
  beforeRedirect: req => {
    const stepData = getFormData(req, stepName);

    if (stepData.tribunalPreviouslyDeterminedTenancyRent !== 'Yes') {
      delete stepData[caseReferenceFieldName];
      return;
    }

    const caseReference = stepData[caseReferenceFieldName];

    if (typeof caseReference === 'string' && caseReference) {
      stepData[caseReferenceFieldName] = normaliseTribunalCaseReference(caseReference);
    }
  },
  fields: [
    {
      name: 'tribunalPreviouslyDeterminedTenancyRent',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.tribunalPreviouslyDeterminedTenancyRent.required',
      options: [
        {
          value: 'Yes',
          translationKey: 'options.Yes.label',
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
        { value: 'No', translationKey: 'options.No.label' },
      ],
    },
  ],
  getInitialFormData: req => {
    const stepData = getFormData(req, stepName);
    const rentDetails = req.session.ccdCase?.currentRentsDetails;
    const answer =
      stepData?.tribunalPreviouslyDeterminedTenancyRent ?? rentDetails?.tribunalPreviouslyDeterminedTenancyRent;
    const caseReference =
      answer === 'Yes' ? (stepData?.[caseReferenceFieldName] ?? rentDetails?.previousTribunalCaseReference) : undefined;

    return {
      ...(answer && { tribunalPreviouslyDeterminedTenancyRent: answer }),
      ...(caseReference && { [caseReferenceFieldName]: caseReference }),
    };
  },
});
