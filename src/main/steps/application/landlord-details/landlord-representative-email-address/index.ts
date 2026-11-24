import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { isValidEmail } from '@utils/email';

const journeyName = 'application';
const stepName = 'landlord-representative-email-address';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordRepresentativeEmailAddress.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'pageTitle',
  },
  fields: [
    {
      name: 'representativeEmailAddress',
      type: 'text',
      required: false,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      classes: 'govuk-input--width-20',
      translationKey: { label: 'heading' },
      errorMessage: 'errors.representativeEmailAddress.required',
      validator: (value): boolean | string => {
        if (value && !isValidEmail(value as string)) {
          return 'errors.representativeEmailAddress.invalid';
        }
        return true;
      },
    },
  ],
});
