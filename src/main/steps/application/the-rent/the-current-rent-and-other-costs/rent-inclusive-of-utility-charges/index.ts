import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'rent-inclusive-of-utility-charges';

const fieldName = 'rentInclusiveOfUtilityCharges';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/rentInclusiveOfUtilityCharges.njk`,
  showCancelButton: false,
  isAnswered: req => Boolean(req.session.ccdCase?.currentRentsDetails?.rentInclusiveOfUtilityCharges),
  beforeRedirect: req => {
    if (req.session.formData?.[stepName]?.[fieldName] === 'Yes') {
      return;
    }
    delete req.session.formData?.['utilities-paid-frequency'];
  },
  fields: [
    {
      name: fieldName,
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: `errors.${fieldName}.required`,
      options: [
        { value: 'Yes', translationKey: 'common:yes' },
        { value: 'No', translationKey: 'common:no' },
      ],
    },
  ],
  getInitialFormData: req => {
    const value =
      req.session.formData?.[stepName]?.[fieldName] ?? req.session.ccdCase?.currentRentsDetails?.[fieldName];

    return {
      ...(value && { [fieldName]: value }),
    };
  },
});
