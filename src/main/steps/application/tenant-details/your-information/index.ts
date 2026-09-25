import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';
import { isValidPersonName } from '@utils/personName';

const journeyName = 'application';
const stepName = 'your-information';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/yourInformation.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
  },
  fields: [
    {
      name: 'applicantFirstName',
      type: 'text',
      required: true,
      isPageHeading: false,
      maxLength: 100,
      translationKey: { label: 'labels.applicantFirstName' },
      errorMessage: 'errors.applicantFirstName.required',
      attributes: {
        autocomplete: 'given-name',
        spellcheck: false,
      },
      validator: (value): boolean | string => {
        if (value && !isValidPersonName(value as string)) {
          return 'errors.applicantFirstName.invalid';
        }
        return true;
      },
    },
    {
      name: 'applicantLastName',
      type: 'text',
      required: true,
      isPageHeading: false,
      maxLength: 100,
      translationKey: { label: 'labels.applicantLastName' },
      errorMessage: 'errors.applicantLastName.required',
      attributes: {
        autocomplete: 'family-name',
        spellcheck: false,
      },
      validator: (value): boolean | string => {
        if (value && !isValidPersonName(value as string)) {
          return 'errors.applicantLastName.invalid';
        }
        return true;
      },
    },
    {
      name: 'companyName',
      type: 'text',
      required: false,
      isPageHeading: false,
      maxLength: 100,
      translationKey: { label: 'labels.companyName' },
      attributes: {
        autocomplete: 'organization',
      },
    },
    {
      name: 'referenceNumberForCommunications',
      type: 'text',
      required: false,
      isPageHeading: false,
      maxLength: 5,
      translationKey: {
        label: 'labels.referenceNumberForCommunications',
        hint: 'hints.referenceNumberForCommunications',
      },
      classes: 'govuk-input--width-20',
    },
  ],
  getInitialFormData: req => {
    const caseData: PTCaseData | undefined = req.session.ccdCase;
    const user = req.session.user;

    const applicantFirstName =
      getFormDataString(req, stepName, 'applicantFirstName') ?? caseData?.applicantFirstName ?? user?.givenName;

    const applicantLastName =
      getFormDataString(req, stepName, 'applicantLastName') ?? caseData?.applicantLastName ?? user?.familyName;

    const companyName = getFormDataString(req, stepName, 'companyName') ?? caseData?.tenantDetails?.companyName;

    const referenceNumberForCommunications =
      getFormDataString(req, stepName, 'referenceNumberForCommunications') ??
      caseData?.tenantDetails?.referenceNumberForCommunications;

    return {
      ...(applicantFirstName && { applicantFirstName }),
      ...(applicantLastName && { applicantLastName }),
      ...(companyName && { companyName }),
      ...(referenceNumberForCommunications && { referenceNumberForCommunications }),
    };
  },
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  return Boolean(ccdCase?.applicantFirstName && ccdCase?.applicantLastName);
}
