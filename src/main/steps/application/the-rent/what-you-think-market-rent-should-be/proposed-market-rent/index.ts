import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { formatRentAmount, getRentAmountError } from '@utils/rentAmount';

const journeyName = 'application';
const stepName = 'proposed-market-rent';

const suggestedRentField = 'applicantSuggestedMarketRent';
const rentFrequencyField = 'applicantSuggestedMarketRentFrequency';
const otherFrequencyField = 'applicantSuggestedMarketRentFrequency';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/proposedMarketRent.njk`,
  showCancelButton: false,
  isAnswered: req =>
    formatRentAmount(req.session.ccdCase?.marketRentDetails?.applicantSuggestedMarketRent) !== undefined,
  translationKeys: {
    pageTitle: 'pageTitle',
  },
  fields: [
    {
      name: suggestedRentField,
      type: 'text',
      required: true,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      classes: 'govuk-input--width-10',
      prefix: { text: '£' },
      attributes: { inputmode: 'decimal' },
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: `errors.${suggestedRentField}.required`,
      validator: (value: unknown): boolean | string => {
        if (!value) {
          return true;
        }

        const error = getRentAmountError(value as string);
        return error ? `errors.${suggestedRentField}.${error}` : true;
      },
    },
    {
      name: rentFrequencyField,
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: {
        label: 'secondQuestionTitle',
        hint: 'secondQuestionHint',
      },
      options: [
        { value: 'Weekly', translationKey: 'options.weekly.label' },
        { value: 'Fortnightly (every 2 weeks)', translationKey: 'options.fortnightly.label' },
        { value: 'Monthly', translationKey: 'options.monthly.label' },
        { value: 'Yearly', translationKey: 'options.yearly.label' },
        {
          value: 'Other',
          translationKey: 'options.other.label',
          subFields: {
            applicantSuggestedMarketRentOtherFrequency: {
              name: `${otherFrequencyField}`,
              type: 'textarea',
              maxLength: 50,
              required: true,
              translationKey: { label: 'options.otherFrequency.label' },
              validator: (value): boolean | string => {
                if (value && String(value).length > 50) {
                  return `errors.${otherFrequencyField}.invalidMaxLength`;
                }

                if (value && String(value).length < 2) {
                  return `errors.${otherFrequencyField}.invalidMinLength`;
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
    const value = formatRentAmount(
      getFormDataString(req, stepName, suggestedRentField) ??
        req.session.ccdCase?.marketRentDetails?.applicantSuggestedMarketRent
    );
    const frequency =
      getFormDataString(req, stepName, 'applicantSuggestedMarketRentFrequency') ??
      req.session.ccdCase?.marketRentDetails?.applicantSuggestedMarketRentFrequency;

    const otherFrequency =
      getFormDataString(req, stepName, 'applicantSuggestedMarketRentOtherFrequency') ??
      req.session.ccdCase?.marketRentDetails?.applicantSuggestedMarketRentOtherFrequency;

    return {
      ...(value !== undefined && { [suggestedRentField]: value }),
      ...(frequency && { applicantSuggestedMarketRentFrequency: frequency }),
      ...(otherFrequency && {
        'applicantSuggestedMarketRentFrequency.applicantSuggestedMarketRentOtherFrequency': otherFrequency,
      }),
    };
  },
});
