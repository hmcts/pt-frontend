import { textAreaIsValidLength } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';

const journeyName = 'application';
const stepName = 'additional-rental-service-charges-vary';

const fieldName = 'additionalRentalServiceChargesVary';
const detailsFieldName = 'varyingAdditionalRentalServiceChargesDetails';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/additionalRentalServiceChargesVary.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),

  beforeRedirect: req => {
    const stepData = req.session.formData?.[stepName];
    if (!stepData) {
      return;
    }
    if (stepData[fieldName] !== 'yes') {
      stepData[`${fieldName}.${detailsFieldName}`] = '';
    }
  },

  fields: [
    {
      name: fieldName,
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: `errors.${fieldName}.required`,
      options: [
        {
          value: 'yes',
          translationKey: 'common:yes',
          subFields: {
            [detailsFieldName]: {
              name: detailsFieldName,
              type: 'character-count' as const,
              required: true,
              maxLength: 500,
              labelClasses: 'govuk-label--s',
              translationKey: { label: `${detailsFieldName}.label` },
              errorMessage: `errors.${detailsFieldName}.required`,
              validator: (value: unknown): boolean | string => {
                if (!textAreaIsValidLength(value as string)) {
                  return `errors.${detailsFieldName}.invalid`;
                }
                return true;
              },
            },
          },
        },
        { value: 'no', translationKey: 'options.no.label' },
      ],
    },
  ],
});
function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const answer = ccdCase?.additionalRentalServiceChargesVary as string | undefined;
  if (answer === 'yes') {
    return Boolean(ccdCase?.varyingAdditionalRentalServiceChargesDetails);
  }
  return answer === 'no';
}
