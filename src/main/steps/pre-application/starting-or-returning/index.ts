import { SIGN_IN_URL } from '../../../urls';
import { flowConfig } from '../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'preApplication';
const stepName = 'starting-or-returning';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/startingOrReturning.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'questionTitle',
  },
  fields: [
    {
      name: 'startingOrReturning',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.startingOrReturning.required',
      options: [
        { value: 'starting', translationKey: 'options.starting.label' },
        { value: 'returning', translationKey: 'options.returning.label' },
      ],
    },
  ],
  beforeRedirect: async req => {
    if (req.body.startingOrReturning === 'returning') {
      return req.res!.redirect(303, SIGN_IN_URL);
    }
  },
});
