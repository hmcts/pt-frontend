import { textAreaIsValidLength } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { getRentAmountError } from '@utils/rentAmount';

const journeyName = 'application';
const stepName = 'utilities-paid-frequency';

const frequencyFieldName = 'utilitiesPaidFrequency';
const detailsFieldName = 'utilitiesFrequencyAndCostDetails';

const amountFieldNames = {
  WEEKLY: 'utilitiesCostWeekly',
  FORTNIGHTLY: 'utilitiesCostFortnightly',
  MONTHLY: 'utilitiesCostMonthly',
  YEARLY: 'utilitiesCostYearly',
} as const;

const buildAmountSubField = (frequency: keyof typeof amountFieldNames) => {
  const name = amountFieldNames[frequency];
  return {
    [name]: {
      name,
      type: 'text' as const,
      required: false,
      labelClasses: 'govuk-label--s',
      classes: 'govuk-input--width-10',
      prefix: { text: '£' },
      attributes: { inputmode: 'decimal' },
      translationKey: { label: `${name}.label` },
      validator: (value: unknown): boolean | string => {
        if (!value) {
          return true;
        }
        const error = getRentAmountError(value as string);
        return error ? `errors.${name}.${error}` : true;
      },
    },
  };
};

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/utilitiesPaidFrequency.njk`,
  showCancelButton: false,
  isAnswered: req => Boolean(req.session.ccdCase?.utilitiesPaidFrequency),

  beforeRedirect: req => {
    const stepData = req.session.formData?.[stepName];
    if (!stepData) {
      return;
    }
    const selected = stepData[frequencyFieldName];
    const selectedAmountField = amountFieldNames[selected as keyof typeof amountFieldNames];
    for (const name of Object.values(amountFieldNames)) {
      if (name !== selectedAmountField) {
        stepData[`${frequencyFieldName}.${name}`] = '';
      }
    }
    if (selected !== 'OTHER') {
      stepData[`${frequencyFieldName}.${detailsFieldName}`] = '';
    }
  },

  fields: [
    {
      name: frequencyFieldName,
      type: 'radio',
      required: false,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      options: [
        { value: 'WEEKLY', translationKey: 'options.WEEKLY.label', subFields: buildAmountSubField('WEEKLY') },
        {
          value: 'FORTNIGHTLY',
          translationKey: 'options.FORTNIGHTLY.label',
          subFields: buildAmountSubField('FORTNIGHTLY'),
        },
        { value: 'MONTHLY', translationKey: 'options.MONTHLY.label', subFields: buildAmountSubField('MONTHLY') },
        { value: 'YEARLY', translationKey: 'options.YEARLY.label', subFields: buildAmountSubField('YEARLY') },
        {
          value: 'OTHER',
          translationKey: 'options.OTHER.label',
          subFields: {
            [detailsFieldName]: {
              name: detailsFieldName,
              type: 'textarea' as const,
              required: false,
              maxLength: 500,
              translationKey: { label: `${detailsFieldName}.label` },
              validator: (value: unknown): boolean | string => {
                if (!textAreaIsValidLength(value as string)) {
                  return `errors.${detailsFieldName}.maxLength`;
                }
                return true;
              },
            },
          },
        },
      ],
    },
  ],
});
