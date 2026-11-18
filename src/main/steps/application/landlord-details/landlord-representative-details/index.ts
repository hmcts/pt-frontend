import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';
import { validatePersonName } from '@utils/personName';

const journeyName = 'application';
const stepName = 'landlord-representative-details';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordRepresentativeDetails.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
  },
  fields: [
    {
      name: 'representativeFirstName',
      type: 'text',
      required: true,
      isPageHeading: false,
      maxLength: 100,
      translationKey: { label: 'labels.representativeFirstName' },
      errorMessage: 'errors.representativeFirstName.required',
      attributes: {
        autocomplete: 'given-name',
        spellcheck: false,
      },
      validator: value => validatePersonName(value, 'representativeFirstName'),
    },
    {
      name: 'representativeLastName',
      type: 'text',
      required: true,
      isPageHeading: false,
      maxLength: 100,
      translationKey: { label: 'labels.representativeLastName' },
      errorMessage: 'errors.representativeLastName.required',
      attributes: {
        autocomplete: 'family-name',
        spellcheck: false,
      },
      validator: value => validatePersonName(value, 'representativeLastName'),
    },
    {
      name: 'representativeCompanyName',
      type: 'text',
      required: false,
      isPageHeading: false,
      maxLength: 100,
      translationKey: { label: 'labels.representativeCompanyName' },
      attributes: {
        autocomplete: 'organization',
      },
    },
  ],
  getInitialFormData: req => {
    const caseData: PTCaseData | undefined = req.session.ccdCase;

    const representativeFirstName =
      getFormDataString(req, stepName, 'representativeFirstName') ?? caseData?.representativeFirstName;
    const representativeLastName =
      getFormDataString(req, stepName, 'representativeLastName') ?? caseData?.representativeLastName;
    const representativeCompanyName =
      getFormDataString(req, stepName, 'representativeCompanyName') ?? caseData?.representativeCompanyName;

    return {
      ...(representativeFirstName && { representativeFirstName }),
      ...(representativeLastName && { representativeLastName }),
      ...(representativeCompanyName && { representativeCompanyName }),
    };
  },
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  return Boolean(ccdCase?.representativeFirstName && ccdCase?.representativeLastName);
}
