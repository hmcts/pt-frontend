import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'indoor-features';
const fieldName = 'indoorFeatures';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/indoorFeatures.njk`,
  showCancelButton: false,
  translationKeys: { pageTitle: 'pageTitle' },
  fields: [
    {
      name: 'indoorFeatures',
      type: 'textarea',
      required: false,
      isPageHeading: false,
      labelClasses: 'govuk-label--m',
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      validator: (value): boolean | string => {
        if (value && String(value).length > 500) {
          return 'errors.indoorFeatures.invalid';
        }
        return true;
      },
    },
  ],
  getInitialFormData: req => {
    const value = getFormDataString(req, stepName, fieldName) ?? req.session.ccdCase?.propertyDetails?.[fieldName];

    return {
      ...(value && { [fieldName]: value }),
    };
  },
});
