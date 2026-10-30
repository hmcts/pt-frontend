import { getTextLengthError } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormData, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';
import { formatRentAmount, getRentAmountError } from '@utils/rentAmount';

const journeyName = 'application';
const stepName = 'proposed-market-rent';

const amountFieldName = 'applicantSuggestedMarketRent';
const frequencyFieldName = 'applicantSuggestedMarketRentFrequency';
const otherFieldName = 'applicantSuggestedMarketRentFrequencyOther';
const otherFormKey = `${frequencyFieldName}.${otherFieldName}`;

const otherMinLength = 2;
const otherMaxLength = 500;

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/proposedMarketRent.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  beforeRedirect: req => {
    const stepData = getFormData(req, stepName);

    if (stepData[frequencyFieldName] !== 'other') {
      stepData[otherFormKey] = '';
    }
  },
  fields: [
    {
      name: amountFieldName,
      type: 'text',
      required: true,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      classes: 'govuk-input--width-10',
      prefix: { text: '£' },
      attributes: { inputmode: 'decimal' },
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: `errors.${amountFieldName}.required`,
      validator: (value: unknown): boolean | string => {
        if (!value) {
          return true;
        }

        const error = getRentAmountError(value as string);
        return error ? `errors.${amountFieldName}.${error}` : true;
      },
    },
    {
      name: frequencyFieldName,
      type: 'radio',
      required: true,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'frequencyQuestion', hint: 'frequencyHint' },
      errorMessage: `errors.${frequencyFieldName}.required`,
      options: [
        { value: 'weekly', translationKey: 'options.weekly.label' },
        { value: 'fortnightly', translationKey: 'options.fortnightly.label' },
        { value: 'monthly', translationKey: 'options.monthly.label' },
        { value: 'yearly', translationKey: 'options.yearly.label' },
        {
          value: 'other',
          translationKey: 'options.other.label',
          subFields: {
            [otherFieldName]: {
              name: otherFieldName,
              type: 'text',
              required: true,
              labelClasses: 'govuk-label--s',
              translationKey: { label: `${otherFieldName}.label` },
              errorMessage: `errors.${otherFieldName}.required`,
              validator: (value: unknown): boolean | string => {
                const error = getTextLengthError(value as string, otherMinLength, otherMaxLength);
                return error ? `errors.${otherFieldName}.${error}` : true;
              },
            },
          },
        },
      ],
    },
  ],
  getInitialFormData: req => {
    const saved = req.session.ccdCase?.marketRentDetails;
    const amount = formatRentAmount(getFormDataString(req, stepName, amountFieldName) ?? saved?.[amountFieldName]);
    const frequency = getFormDataString(req, stepName, frequencyFieldName) ?? saved?.[frequencyFieldName];
    const other =
      frequency === 'other' ? (getFormDataString(req, stepName, otherFormKey) ?? saved?.[otherFieldName]) : undefined;

    return {
      ...(amount !== undefined && { [amountFieldName]: amount }),
      ...(frequency && { [frequencyFieldName]: frequency }),
      ...(other && { [otherFormKey]: other }),
    };
  },
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const details = ccdCase?.marketRentDetails;

  if (formatRentAmount(details?.[amountFieldName]) === undefined) {
    return false;
  }

  if (details?.[frequencyFieldName] === 'other') {
    return Boolean(details?.[otherFieldName]);
  }

  return Boolean(details?.[frequencyFieldName]);
}
