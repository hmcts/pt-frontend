import { Request } from 'express';

import { flowConfig } from '../../flow.config';

import { clearFormData, createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { getCaseApi } from '@services/ccdApiClient';

const journeyName = 'deleteApplication';
const stepName = 'delete-application-confirmation';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/deleteApplicationConfirmation.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'questionTitle',
  },
  fields: [
    {
      name: 'deleteApplicationConfirmation',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.applicationDeleteConfirmation.required',
      options: [
        { value: 'yes', translationKey: 'common:yes' },
        { value: 'no', translationKey: 'options.no.label' },
      ],
    },
  ],
  beforeRedirect: async (req: Request) => {
    const caseReference = String(req.params.caseReference);

    if (req.body.deleteApplicationConfirmation === 'no') {
      return req.res!.redirect(303, `/${caseReference}/task-list`);
    }

    const ccdCaseApi = getCaseApi(req.session.user);
    await ccdCaseApi.deleteCase(caseReference);

    clearFormData(req);
  },
});
