import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormDataString, getTranslationFunction } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { formatRentAmount, getRentAmountError } from '@utils/rentAmount';

const journeyName = 'application';
const stepName = 'proposed-market-rent';

const fieldName = 'applicantSuggestedMarketRent';

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

  // The heading asks for the rent in the frequency given in the current rent
  // section, and reads without one until that question has been answered.
  extendGetContent: req => {
    const t = getTranslationFunction(req);
    const paymentFrequency =
      getFormDataString(req, 'rent-payment-frequency', 'rentPaymentFrequency') ??
      req.session.ccdCase?.currentRentsDetails?.rentPaymentFrequency;

    return {
      frequency: paymentFrequency ? t(`frequency.${paymentFrequency}`) : '',
    };
  },
  fields: [
    {
      name: fieldName,
      type: 'text',
      required: true,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      classes: 'govuk-input--width-10',
      prefix: { text: '£' },
      attributes: { inputmode: 'decimal' },
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: `errors.${fieldName}.required`,
      validator: (value: unknown): boolean | string => {
        if (!value) {
          return true;
        }

        const error = getRentAmountError(value as string);
        return error ? `errors.${fieldName}.${error}` : true;
      },
    },
  ],
  getInitialFormData: req => {
    const value = formatRentAmount(
      getFormDataString(req, stepName, fieldName) ??
        req.session.ccdCase?.marketRentDetails?.applicantSuggestedMarketRent
    );

    return {
      ...(value !== undefined && { [fieldName]: value }),
    };
  },
});
