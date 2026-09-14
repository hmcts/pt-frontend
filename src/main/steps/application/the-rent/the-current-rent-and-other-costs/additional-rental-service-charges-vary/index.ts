import { textAreaIsValidLength } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormData } from '@modules/steps';
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
    const stepData = getFormData(req, stepName);
    if (stepData[fieldName] !== 'Yes') {
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
          value: 'Yes',
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
        { value: 'No', translationKey: 'options.No.label' },
      ],
    },
  ],
  getInitialFormData: req => {
    const stepData = getFormData(req, stepName);
    const rentDetails = req.session.ccdCase?.currentRentsDetails;
    const answer = stepData?.[fieldName] ?? rentDetails?.additionalRentalServiceChargesVary;
    const details =
      answer === 'Yes'
        ? (stepData?.[`${fieldName}.${detailsFieldName}`] ?? rentDetails?.varyingAdditionalRentalServiceChargesDetails)
        : undefined;

    return {
      ...(answer && { [fieldName]: answer }),
      ...(details && { [`${fieldName}.${detailsFieldName}`]: details }),
    };
  },
});
function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const answer = ccdCase?.currentRentsDetails?.additionalRentalServiceChargesVary as string | undefined;
  if (answer === 'Yes') {
    return Boolean(ccdCase?.currentRentsDetails?.varyingAdditionalRentalServiceChargesDetails);
  }
  return answer === 'No';
}
