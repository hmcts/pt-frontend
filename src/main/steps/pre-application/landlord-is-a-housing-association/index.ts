import { SIGN_IN_URL } from '../../../urls';
import { flowConfig } from '../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'preApplication';
const stepName = 'landlord-is-a-housing-association';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordIsAHousingAssociation.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'questionTitle',
  },
  fields: [
    {
      name: 'landlordIsAHousingAssociation',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.landlordIsAHousingAssociation.required',
      options: [
        { value: 'yes', translationKey: 'common:yes' },
        { value: 'no', translationKey: 'common:no' },
      ],
    },
  ],
  beforeRedirect: async req => {
    if (req.body.landlordIsAHousingAssociation === 'no') {
      return req.res!.redirect(303, SIGN_IN_URL);
    }
  },
});
