import { Request } from 'express';

import { getCaseApi } from '../../../case/ccdApiClient';
import { flowConfig } from '../flow.config';

import { createFormStep, getFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'newApplication';
const stepName = 'tenancy-type';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/tenancyType.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'questionTitle',
  },
  fields: [
    {
      name: 'tenancyType',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.tenancyType.required',
      options: [
        {
          value: 'assuredPeriodicTenancy',
          translationKey: 'options.assuredPeriodicTenancy.label',
          hint: 'options.assuredPeriodicTenancy.hint',
        },
        { value: 'agriculturalOccupancy', translationKey: 'options.agriculturalOccupancy.label' },
      ],
    },
  ],
  beforeRedirect: async (req: Request) => {
    const ccdCaseApi = getCaseApi(req.session.user);

    const applicationType: string = getFormData(req, 'application-type').applicationType as string;
    const tenancyType: string = getFormData(req, 'tenancy-type').tenancyType as string;

    const ccdCase = await ccdCaseApi.createCase({
      applicationType,
      tenancyType,
    });

    //  TODO: resolve error -> message: 'Cannot find event citizen-create-application for case type PT',
    const caseReference = ccdCase.id;
    const redirectPath = `/case/${caseReference}/application/task-list`;

    return req.res!.redirect(303, redirectPath);
  },
});
