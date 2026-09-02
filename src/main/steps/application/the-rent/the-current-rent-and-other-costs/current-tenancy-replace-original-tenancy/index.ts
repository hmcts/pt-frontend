import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

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
  isAnswered: req => Boolean(req.session.ccdCase?.currentTenancyReplaceOriginalTenancy),

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
