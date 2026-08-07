import { flowConfig } from '../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'newApplication';
const stepName = 'application-type';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/applicationType.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'questionTitle',
  },
  fields: [
    {
      name: 'applicationType',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.applicationType.required',
      options: [
        {
          value: 'challengeRentIncrease',
          translationKey: 'options.challengeRentIncrease.label',
          hint: 'options.challengeRentIncrease.hint',
        },
        { value: 'challengeExcessiveRent', translationKey: 'options.challengeExcessiveRent.label' },
      ],
    },
  ],
});
