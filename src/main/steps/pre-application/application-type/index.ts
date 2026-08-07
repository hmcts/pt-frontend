import { flowConfig } from '../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'preApplication';
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
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.applicationType.required',
      options: [
        {
          value: 'openMarketRentDetermination',
          translationKey: 'options.openMarketRentDetermination.label',
          hint: 'options.openMarketRentDetermination.hint',
        },
        { value: 'onlyChallengeLegalValidity', translationKey: 'options.onlyChallengeLegalValidity.label' },
      ],
    },
  ],
});
