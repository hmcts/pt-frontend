import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';
import { toDateParts } from '@utils/date';

const journeyName = 'application';
const stepName = 'current-tenancy-replace-original-tenancy';

const fieldName = 'currentTenancyReplaceOriginalTenancy';
const startDateFieldName = 'originalTenancyStartDate';
const startDatePartNames = ['day', 'month', 'year'] as const;

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/currentTenancyReplaceOriginalTenancy.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),

  beforeRedirect: req => {
    const stepData = getFormData(req, stepName);
    if (stepData[fieldName] !== 'Yes') {
      for (const part of startDatePartNames) {
        stepData[`${fieldName}.${startDateFieldName}-${part}`] = '';
      }
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
            [startDateFieldName]: {
              name: startDateFieldName,
              type: 'date' as const,
              required: true,
              noFutureDate: true,
              legendClasses: 'govuk-fieldset__legend--s',
              translationKey: { label: `${startDateFieldName}.label` },
            },
          },
        },
        { value: 'No', translationKey: 'common:no' },
        { value: 'NotSure', translationKey: 'options.NotSure.label' },
      ],
    },
  ],
  getInitialFormData: req => {
    const stepData = getFormData(req, stepName);
    const rentDetails = req.session.ccdCase?.currentRentsDetails;
    const answer = stepData?.[fieldName] ?? rentDetails?.currentTenancyReplaceOriginalTenancy;
    const startDate = answer === 'Yes' ? toDateParts(rentDetails?.originalTenancyStartDate) : undefined;

    return {
      ...(answer && { [fieldName]: answer }),
      ...Object.fromEntries(
        startDatePartNames
          .map(part => [
            `${fieldName}.${startDateFieldName}-${part}`,
            stepData?.[`${fieldName}.${startDateFieldName}-${part}`] ?? startDate?.[part],
          ])
          .filter(([, value]) => value)
      ),
    };
  },
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const answer = ccdCase?.currentRentsDetails?.currentTenancyReplaceOriginalTenancy as string | undefined;
  if (answer === 'Yes') {
    const startDate = ccdCase?.currentRentsDetails?.originalTenancyStartDate;
    return Boolean(startDate);
  }
  return answer === 'No' || answer === 'NotSure';
}
