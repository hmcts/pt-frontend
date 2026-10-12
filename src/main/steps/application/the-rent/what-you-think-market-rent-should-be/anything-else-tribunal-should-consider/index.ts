import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';

const journeyName = 'application';
const stepName = 'anything-else-tribunal-should-consider';

const fieldName = 'additionalInfoToConsiderWhenDeterminingRent';
const detailsFieldName = 'additionalInfoToConsiderWhenDeterminingRentDetails';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/anythingElseTribunalShouldConsider.njk`,
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
      required: false,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
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
              translationKey: { label: `${detailsFieldName}.label` },
              errorMessage: `errors.${detailsFieldName}.required`,
            },
          },
        },
        { value: 'No', translationKey: 'common:no' },
      ],
    },
  ],
  getInitialFormData: req => {
    const stepData = getFormData(req, stepName);
    const marketRentDetails = req.session.ccdCase?.marketRentDetails;
    const answer = stepData[fieldName] ?? marketRentDetails?.additionalPropertyInfoToConsiderWhenDetermining;
    const details =
      answer === 'Yes'
        ? (stepData[`${fieldName}.${detailsFieldName}`] ??
          marketRentDetails?.additionalPropertyInfoToConsiderWhenDeterminingDetails)
        : undefined;

    return {
      ...(answer && { [fieldName]: answer }),
      ...(details && { [`${fieldName}.${detailsFieldName}`]: details }),
    };
  },
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const answer = ccdCase?.marketRentDetails?.additionalPropertyInfoToConsiderWhenDetermining as string | undefined;
  if (answer === 'Yes') {
    return Boolean(ccdCase?.marketRentDetails?.additionalPropertyInfoToConsiderWhenDeterminingDetails);
  }
  return answer === 'No';
}
