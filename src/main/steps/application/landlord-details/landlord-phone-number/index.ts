import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { VALID_PHONE_NUMBER_REGEX, isValidPhoneNumber } from '@utils/phoneNumber';

const journeyName = 'application';
const stepName = 'landlord-phone-number';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordPhoneNumber.njk`,
  showCancelButton: false,
  isAnswered: req =>
    Boolean(
      req.session.ccdCase?.landlordPhoneNumber &&
      isValidPhoneNumber(req.session.ccdCase?.landlordPhoneNumber, VALID_PHONE_NUMBER_REGEX)
    ),
  fields: [
    {
      name: 'landlordPhoneNumber',
      type: 'text',
      required: false,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      legendClasses: 'govuk-fieldset__legend--l',
      classes: 'govuk-input--width-10',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      validator: (value): boolean | string => {
        if (value && !isValidPhoneNumber(value as string, VALID_PHONE_NUMBER_REGEX)) {
          return 'errors.landlordPhoneNumber.invalid';
        }
        return true;
      },
    },
  ],
});
