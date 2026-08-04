import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { isValidEmail } from '@utils/email';

const journeyName = 'application';
const stepName = 'landlord-email-address';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordEmailAddress.njk`,
  showCancelButton: false,
  isAnswered: req =>
    Boolean(req.session.ccdCase?.landlordEmailAddress && isValidEmail(req.session.ccdCase?.landlordEmailAddress)),
  translationKeys: {
    pageTitle: 'pageTitle',
  },
  fields: [
    {
      name: 'landlordEmailAddress',
      type: 'text',
      required: true,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      classes: 'govuk-input--width-20',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: 'errors.landlordEmailAddress.required',
      validator: (value): boolean | string => {
        if (value && !isValidEmail(value as string)) {
          return 'errors.landlordEmailAddress.invalid';
        }
        return true;
      },
    },
  ],
});
