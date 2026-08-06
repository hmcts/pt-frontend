import { SIGN_IN_URL } from '../../../urls';
import { flowConfig } from '../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'preApplication';
const stepName = 'who-is-named-on-your-tenancy-agreement';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/whoIsNamedOnYourTenancyAgreement.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'questionTitle',
  },
  fields: [
    {
      name: 'tenantOrJointTenant',
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.tenantOrJointTenant.required',
      options: [
        {
          value: 'tenant',
          translationKey: 'options.tenant.label',
          hint: 'options.tenant.hint',
        },
        {
          value: 'jointTenant',
          translationKey: 'options.jointTenant.label',
          hint: 'options.jointTenant.hint',
        },
        { value: 'notSure', translationKey: 'options.notSure.label' },
      ],
    },
  ],
  beforeRedirect: async req => {
    if (req.body.tenantOrJointTenant === 'tenant') {
      return req.res!.redirect(303, SIGN_IN_URL);
    }
  },
});
