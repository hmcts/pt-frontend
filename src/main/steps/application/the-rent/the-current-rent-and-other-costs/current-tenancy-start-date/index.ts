import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'current-tenancy-start-date';
const fieldName = 'currentTenancyStartDate';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/currentTenancyStartDate.njk`,
  showCancelButton: false,
  isAnswered: req => Boolean(req.session.ccdCase?.currentTenancyStartDate),
  fields: [
    {
      name: fieldName,
      type: 'date',
      required: true,
      noFutureDate: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
    },
  ],
});
