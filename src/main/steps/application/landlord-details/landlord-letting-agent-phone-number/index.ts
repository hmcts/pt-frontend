import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { VALID_PHONE_NUMBER_REGEX, isValidPhoneNumber } from '@utils/phoneNumber';

const journeyName = 'application';
const stepName = 'landlord-letting-agent-phone-number';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordLettingAgentPhoneNumber.njk`,
  showCancelButton: false,
  isAnswered: req =>
    Boolean(
      req.session.ccdCase?.lettingAgentPhoneNumber &&
      isValidPhoneNumber(req.session.ccdCase?.lettingAgentPhoneNumber, VALID_PHONE_NUMBER_REGEX)
    ),
  translationKeys: {
    pageTitle: 'pageTitle',
  },
  fields: [
    {
      name: 'lettingAgentPhoneNumber',
      type: 'text',
      required: false,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      legendClasses: 'govuk-fieldset__legend--l',
      classes: 'govuk-input--width-10',
      translationKey: { label: 'heading' },
      validator: (value): boolean | string => {
        if (value && !isValidPhoneNumber(value as string, VALID_PHONE_NUMBER_REGEX)) {
          return 'errors.lettingAgentPhoneNumber.invalid';
        }
        return true;
      },
    },
  ],
});
