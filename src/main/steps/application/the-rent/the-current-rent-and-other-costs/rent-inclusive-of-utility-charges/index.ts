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
  isAnswered: req => Boolean(req.session.ccdCase?.rentInclusiveOfUtilityCharges),
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
        { value: 'yes', translationKey: 'common:yes' },
        { value: 'no', translationKey: 'common:no' },
      ],
    },
  ],
});
