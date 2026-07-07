import { flowConfig } from '../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'preApplication';
const stepName = 'applying-for-yourself-or-someone-else';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/applyingForYourselfOrSomeoneElse.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'questionTitle',
  },
  fields: [
    {
      name: 'applyingForYourselfOrSomeoneElse',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.applyingForYourselfOrSomeoneElse.required',
      options: [
        { value: 'myself', translationKey: 'options.myself.label', hint: 'options.myself.hint' },
        { value: 'someoneElse', translationKey: 'options.someoneElse.label', hint: 'options.someoneElse.hint' },
      ],
    },
  ],
});
