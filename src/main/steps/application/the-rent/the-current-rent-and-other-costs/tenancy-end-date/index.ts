import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { toDateParts } from '@utils/date';

const journeyName = 'application';
const stepName = 'tenancy-end-date';
const fieldName = 'currentTenancyEndDate';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/tenancyEndDate.njk`,
  showCancelButton: false,
  isAnswered: req => Boolean(req.session.ccdCase?.currentRentsDetails?.currentTenancyEndDate),
  fields: [
    {
      name: fieldName,
      type: 'date',
      required: true,
      noPastDate: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
    },
  ],
  getInitialFormData: req => {
    const value =
      getFormData(req, stepName)[fieldName] ??
      toDateParts(req.session.ccdCase?.currentRentsDetails?.currentTenancyEndDate);

    return {
      ...(value && { [fieldName]: value }),
    };
  },
});
