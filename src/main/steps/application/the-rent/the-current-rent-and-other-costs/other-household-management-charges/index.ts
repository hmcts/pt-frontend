import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormDataScope, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'other-household-management-charges';

const fieldName = 'anyOtherHouseholdManagementCharges';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/otherHouseholdManagementCharges.njk`,
  showCancelButton: false,
  isAnswered: req => Boolean(req.session.ccdCase?.currentRentsDetails?.anyOtherHouseholdManagementCharges),
  beforeRedirect: req => {
    if (getFormDataString(req, stepName, fieldName) === 'Yes') {
      return;
    }
    delete req.session.formData?.[getFormDataScope(req)]?.['other-household-management-charges-details'];
    delete req.session.formData?.[getFormDataScope(req)]?.['additional-rental-service-charges-vary'];
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
    const value = getFormDataString(req, stepName, fieldName) ?? req.session.ccdCase?.currentRentsDetails?.[fieldName];

    return {
      ...(value && { [fieldName]: value }),
    };
  },
});
