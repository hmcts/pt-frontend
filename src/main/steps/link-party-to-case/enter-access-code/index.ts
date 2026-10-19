import { Request } from 'express';

import { flowConfig } from '../flow.config';

import { createFormStep } from '@modules/steps';
import { StepDefinition } from '@modules/steps/stepFormData.interface';
import { getPtApi } from '@services/ptApi/ptApiClient';
import { isValidAccessCode, normaliseAccessCode } from '@utils/accessCode';
import { isValidCaseReference } from '@utils/caseReference';

const journeyName = 'linkPartyToCase';
const stepName = 'enter-access-code';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/enterAccessCode.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'pageHeading',
  },
  fields: [
    {
      name: 'caseReference',
      type: 'text',
      required: true,
      isPageHeading: false,
      labelClasses: 'govuk-label--l',
      legendClasses: 'govuk-fieldset__legend--l',
      classes: 'govuk-input--width-20',
      translationKey: { label: 'caseReference.label', hint: 'caseReference.hint' },
      errorMessage: 'errors.caseReference.required',
      validator: (value): boolean | string => {
        if (value && !isValidCaseReference(value as string)) {
          return 'errors.caseReference.invalid';
        }
        return true;
      },
    },
    {
      name: 'accessCode',
      type: 'text',
      required: true,
      isPageHeading: false,
      labelClasses: 'govuk-label--l',
      legendClasses: 'govuk-fieldset__legend--l',
      classes: 'govuk-input--width-20',
      translationKey: { label: 'accessCode.label', hint: 'accessCode.hint' },
      errorMessage: 'errors.accessCode.required',
      validator: (value): boolean | string => {
        if (value && !isValidAccessCode(value as string)) {
          return 'errors.accessCode.invalid';
        }
        return true;
      },
    },
  ],
  beforeRedirect: async (req: Request) => {
    const user = req.session?.user;
    const ptApi = getPtApi(user);
    const caseReference = String(req.params.caseReference);
    const normalisedAccessCode = normaliseAccessCode(req.body.accessCode);
    await ptApi.linkPartyToCase(caseReference, normalisedAccessCode);
  },
});
