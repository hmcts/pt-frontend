import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { getRentAmountError } from '@utils/rentAmount';

const journeyName = 'application';
const stepName = 'rent-payment-frequency';

const frequencyFieldName = 'rentPaymentFrequency';

/**
 * Stateless step: how often does the applicant pay rent, and how much?
 * Each frequency reveals its own amount input, because the backend stores the
 * amount in a column specific to the frequency (rent_cost_weekly and so on).
 * Only the selected frequency's amount is kept; the others are cleared before
 * redirecting so a changed answer does not leave two amounts in the session.
 */

const amountFieldNames = {
  WEEKLY: 'rentCostWeekly',
  FORTNIGHTLY: 'rentCostFortnightly',
  MONTHLY: 'rentCostMonthly',
  YEARLY: 'rentCostYearly',
} as const;

const buildAmountSubField = (frequency: keyof typeof amountFieldNames) => {
  const name = amountFieldNames[frequency];

  return {
    [name]: {
      name,
      type: 'text' as const,
      required: true,
      labelClasses: 'govuk-label--s',
      classes: 'govuk-input--width-10',
      prefix: { text: '£' },
      // 'decimal' rather than 'numeric' so the mobile keypad includes a decimal
      // point, otherwise pence cannot be entered.
      attributes: { inputmode: 'decimal' },
      translationKey: {
        label: `${name}.label`,
        hint: `${name}.hint`,
      },
      errorMessage: `errors.${name}.required`,
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
  customTemplate: `${__dirname}/rentPaymentFrequency.njk`,
  showCancelButton: false,
  isAnswered: req => Boolean(req.session.ccdCase?.rentPaymentFrequency),

  // Runs after setFormData has written the whole POST body to the session. The
  // conditional reveal only hides inputs with CSS, so the browser submits all
  // four amounts; this discards the three that do not apply.
  beforeRedirect: req => {
    const stepData = req.session.formData?.[stepName];
    if (!stepData) {
      return;
    }

    const selected = stepData[frequencyFieldName];

    for (const name of Object.values(amountFieldNames)) {
      const key = `${frequencyFieldName}.${name}`;
      if (selected !== undefined && name !== amountFieldNames[selected as keyof typeof amountFieldNames]) {
        stepData[key] = '';
      }
    }
  },
  fields: [
    {
      name: frequencyFieldName,
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: `errors.${frequencyFieldName}.required`,
      options: [
        { value: 'WEEKLY', translationKey: 'options.WEEKLY.label', subFields: buildAmountSubField('WEEKLY') },
        {
          value: 'FORTNIGHTLY',
          translationKey: 'options.FORTNIGHTLY.label',
          subFields: buildAmountSubField('FORTNIGHTLY'),
        },
        { value: 'MONTHLY', translationKey: 'options.MONTHLY.label', subFields: buildAmountSubField('MONTHLY') },
        { value: 'YEARLY', translationKey: 'options.YEARLY.label', subFields: buildAmountSubField('YEARLY') },
      ],
    },
  ],
});
