import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { CcdCaseData } from '@services/ccdCase.interface';

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
    const stepData = req.session.formData?.[stepName];
    if (!stepData) {
      return;
    }
    if (stepData[fieldName] !== 'yes') {
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
          value: 'yes',
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
        { value: 'no', translationKey: 'common:no' },
        { value: 'notSure', translationKey: 'options.notSure.label' },
      ],
    },
  ],
});

function isAnswered(ccdCase: CcdCaseData): boolean {
  const answer = ccdCase.currentTenancyReplaceOriginalTenancy as string | undefined;
  if (answer === 'yes') {
    const startDate = ccdCase.originalTenancyStartDate;
    return Boolean(startDate?.day && startDate?.month && startDate?.year);
  }
  return answer === 'no' || answer === 'notSure';
}
