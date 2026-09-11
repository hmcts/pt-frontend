import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { isValidEmail } from '@utils/email';

const journeyName = 'application';
const stepName = 'landlord-letting-agent-email-address';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordLettingAgentEmailAddress.njk`,
  showCancelButton: false,
  isAnswered: req =>
    Boolean(
      req.session.ccdCase?.lettingAgentEmailAddress && isValidEmail(req.session.ccdCase?.lettingAgentEmailAddress)
    ),
  fields: [
    {
      name: 'lettingAgentEmailAddress',
      type: 'text',
      required: true,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      classes: 'govuk-input--width-20',
      translationKey: { label: 'heading' },
      validator: (value): boolean | string => {
        if (value && !isValidEmail(value as string)) {
          return 'errors.lettingAgentEmailAddress.invalid';
        }
        return true;
      },
    },
  ],
});
