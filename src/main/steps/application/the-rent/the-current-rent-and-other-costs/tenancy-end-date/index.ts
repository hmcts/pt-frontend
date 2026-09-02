import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'tenancy-end-date';
const fieldName = 'tenancyEndDate';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/tenancyEndDate.njk`,
  showCancelButton: false,
  isAnswered: req => Boolean(req.session.ccdCase?.tenancyEndDate),
  fields: [
    {
      name: fieldName,
      type: 'date',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
    },
  ],
});
