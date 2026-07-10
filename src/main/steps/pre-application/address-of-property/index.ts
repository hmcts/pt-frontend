import { flowConfig } from '../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { isValidPostcode } from '@utils/postcode';

const journeyName = 'preApplication';
const stepName = 'address-of-property';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/addressOfProperty.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'questionTitle',
  },
  fields: [
    {
      name: 'addressPostcode',
      type: 'text',
      required: true,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      legendClasses: 'govuk-fieldset__legend--l',
      classes: 'govuk-input--width-10',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: 'errors.addressPostcode.required',
      validator: (value): boolean | string => {
        if (value && !isValidPostcode(value as string)) {
          return 'errors.addressPostcode.invalid';
        }
        return true;
      },
    },
  ],
});
