import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { VALID_PHONE_NUMBER_REGEX, isValidPhoneNumber } from '@utils/phoneNumber';

const journeyName = 'application';
const stepName = 'contact-by-phone';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/contactByPhone.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'pageTitle',
    contactByPhoneInfo: 'contactByPhoneInfo',
  },
  isAnswered: req =>
    Boolean(
      req.session.ccdCase?.phoneNumberForCalls &&
      isValidPhoneNumber(req.session.ccdCase?.phoneNumberForCalls, VALID_PHONE_NUMBER_REGEX)
    ),
  fields: [
    {
      name: 'phoneNumberForCalls',
      type: 'text',
      required: false,
      isPageHeading: false,
      labelClasses: 'govuk-label--m',
      legendClasses: 'govuk-fieldset__legend--l',
      classes: 'govuk-input--width-10',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      validator: (value): boolean | string => {
        if (value && !isValidPhoneNumber(value as string, VALID_PHONE_NUMBER_REGEX)) {
          return 'errors.phoneNumberForCalls.invalid';
        }
        return true;
      },
    },
  ],
});
