import { textAreaIsValidLength } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { getRentAmountError } from '@utils/rentAmount';

const journeyName = 'application';
const stepName = 'utilities-paid-frequency';

const frequencyFieldName = 'utilitiesPaidFrequency';
const detailsFieldName = 'utilitiesPaidFrequencyAndCostDetails';

const amountFieldNames = {
  weekly: 'utilitiesPaidCostWeekly',
  fortnightly: 'utilitiesPaidCostFortnightly',
  monthly: 'utilitiesPaidCostMonthly',
  yearly: 'utilitiesPaidCostYearly',
} as const;

// RentDetails mirrors CurrentRentsDetailsDto, which drops "Paid" from the utilities cost fields.
const caseFieldNames = {
  utilitiesPaidCostWeekly: 'utilitiesCostWeekly',
  utilitiesPaidCostFortnightly: 'utilitiesCostFortnightly',
  utilitiesPaidCostMonthly: 'utilitiesCostMonthly',
  utilitiesPaidCostYearly: 'utilitiesCostYearly',
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
  isAnswered: req => Boolean(req.session.ccdCase?.currentRentsDetails?.utilitiesPaidFrequency),

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
    if (selected !== 'other') {
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
        { value: 'weekly', translationKey: 'options.weekly.label', subFields: buildAmountSubField('weekly') },
        {
          value: 'fortnightly',
          translationKey: 'options.fortnightly.label',
          subFields: buildAmountSubField('fortnightly'),
        },
        { value: 'monthly', translationKey: 'options.monthly.label', subFields: buildAmountSubField('monthly') },
        { value: 'yearly', translationKey: 'options.yearly.label', subFields: buildAmountSubField('yearly') },
        {
          value: 'other',
          translationKey: 'options.other.label',
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
  getInitialFormData: req => {
    const stepData = req.session.formData?.[stepName];
    const rentDetails = req.session.ccdCase?.currentRentsDetails;
    const frequency = stepData?.[frequencyFieldName] ?? rentDetails?.[frequencyFieldName];
    const amountFieldName = amountFieldNames[frequency as keyof typeof amountFieldNames];
    const amount = amountFieldName
      ? (stepData?.[`${frequencyFieldName}.${amountFieldName}`] ??
        rentDetails?.[caseFieldNames[amountFieldName as keyof typeof caseFieldNames]])
      : undefined;
    const details = stepData?.[`${frequencyFieldName}.${detailsFieldName}`] ?? rentDetails?.[detailsFieldName];

    return {
      ...(frequency && { [frequencyFieldName]: frequency }),
      ...(amount && { [`${frequencyFieldName}.${amountFieldName}`]: String(amount) }),
      ...(details && { [`${frequencyFieldName}.${detailsFieldName}`]: details }),
    };
  },
});
