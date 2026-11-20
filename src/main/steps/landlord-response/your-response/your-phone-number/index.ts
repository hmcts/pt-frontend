import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { isValidPhoneNumber } from '@utils/phoneNumber';

const journeyName = 'landlord-response';
const stepName = 'your-phone-number';
const fieldName = 'landlordPhoneNumber';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/yourPhoneNumber.njk`,
  showCancelButton: false,
  isAnswered: req => {
    const phoneNumber = req.session.ccdCase?.landlordResponse?.landlordPhoneNumber;
    return Boolean(phoneNumber && isValidPhoneNumber(phoneNumber));
  },
  fields: [
    {
      name: fieldName,
      type: 'text',
      required: true,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      classes: 'govuk-input--width-20',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: `errors.${fieldName}.required`,
      attributes: {
        autocomplete: 'tel',
      },
      validator: (value): boolean | string => {
        if (value && !isValidPhoneNumber(value as string)) {
          return `errors.${fieldName}.invalid`;
        }
        return true;
      },
    },
  ],
  getInitialFormData: req => {
    const value =
      getFormDataString(req, stepName, fieldName) ?? req.session.ccdCase?.landlordResponse?.landlordPhoneNumber;

    return {
      ...(value && { [fieldName]: value }),
    };
  },
});
