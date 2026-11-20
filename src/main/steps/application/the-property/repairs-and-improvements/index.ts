import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'repairs-and-improvements';
const fieldName = 'anyTenantsMadePropertyRepairs';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/repairsAndImprovements.njk`,
  showCancelButton: false,
  isAnswered: req => Boolean(req.session.ccdCase?.propertyDetails?.anyTenantsMadePropertyRepairs),
  fields: [
    {
      name: 'anyTenantsMadePropertyRepairs',
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      options: [
        { value: 'Yes', translationKey: 'common:yes' },
        { value: 'No', translationKey: 'common:no' },
        { value: 'NotSure', translationKey: 'options.notSure.label' },
      ],
    },
  ],
  getInitialFormData: req => {
    const propertyDetails = req.session.ccdCase?.propertyDetails;
    const value = getFormDataString(req, stepName, fieldName) ?? propertyDetails?.[fieldName];

    return {
      ...(value && { [fieldName]: value }),
    };
  },
});
