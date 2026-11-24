import { getTooShortErrorIfUnderMinimumCharacters } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

const journeyName = 'application';
const stepName = 'landlord-representative-address';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordRepresentativeAddress.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
    headingHint: 'headingHint',
  },
  fields: [
    {
      name: 'representativeAddressLine1',
      type: 'text',
      required: true,
      isPageHeading: false,
      classes: 'govuk-!-width-full',
      maxLength: 100,
      translationKey: { label: 'labels.representativeAddressLine1' },
      errorMessage: 'errors.representativeAddressLine1.required',
      attributes: {
        autocomplete: 'address-line1',
      },
      validator: value => getTooShortErrorIfUnderMinimumCharacters(value, 'representativeAddressLine1'),
    },
    {
      name: 'representativeAddressLine2',
      type: 'text',
      required: false,
      isPageHeading: false,
      classes: 'govuk-!-width-full',
      maxLength: 100,
      translationKey: { label: 'labels.representativeAddressLine2' },
      attributes: {
        autocomplete: 'address-line2',
      },
      validator: value => getTooShortErrorIfUnderMinimumCharacters(value, 'representativeAddressLine2'),
    },
    {
      name: 'representativePostTown',
      type: 'text',
      required: true,
      isPageHeading: false,
      classes: 'govuk-!-width-two-thirds',
      maxLength: 100,
      translationKey: { label: 'labels.representativePostTown' },
      attributes: {
        autocomplete: 'address-level2',
      },
      validator: value => getTooShortErrorIfUnderMinimumCharacters(value, 'representativePostTown'),
    },
    {
      name: 'representativeCounty',
      type: 'text',
      required: false,
      isPageHeading: false,
      classes: 'govuk-!-width-two-thirds',
      maxLength: 100,
      translationKey: { label: 'labels.representativeCounty' },
      attributes: {
        autocomplete: 'address-level1',
      },
      validator: value => getTooShortErrorIfUnderMinimumCharacters(value, 'representativeCounty'),
    },
    {
      name: 'representativePostcode',
      type: 'text',
      required: false,
      isPageHeading: false,
      classes: 'govuk-!-width-one-third',
      translationKey: { label: 'labels.representativePostcode', hint: 'hints.representativePostcode' },
    },
  ],

  getInitialFormData: req => {
    const caseData: PTCaseData | undefined = req.session.ccdCase;

    const representativeAddressLine1 =
      getFormDataString(req, stepName, 'representativeAddressLine1') ?? caseData?.representativeAddressLine1;
    const representativeAddressLine2 =
      getFormDataString(req, stepName, 'representativeAddressLine2') ?? caseData?.representativeAddressLine2;
    const representativePostTown =
      getFormDataString(req, stepName, 'representativePostTown') ?? caseData?.representativePostTown;
    const representativeCounty =
      getFormDataString(req, stepName, 'representativeCounty') ?? caseData?.representativeCounty;
    const representativePostcode =
      getFormDataString(req, stepName, 'representativePostcode') ?? caseData?.representativePostcode;

    return {
      ...(representativeAddressLine1 && { representativeAddressLine1 }),
      ...(representativeAddressLine2 && { representativeAddressLine2 }),
      ...(representativePostTown && { representativePostTown }),
      ...(representativeCounty && { representativeCounty }),
      ...(representativePostcode && { representativePostcode }),
    };
  },
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  return Boolean(ccdCase?.representativeAddressLine1 && ccdCase?.representativePostTown);
}
