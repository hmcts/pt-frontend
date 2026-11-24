import { getTooShortErrorIfUnderMinimumCharacters } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

const journeyName = 'application';
const stepName = 'landlord-address';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordAddress.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
    headingHint: 'headingHint',
  },
  fields: [
    {
      name: 'landlordAddressLine1',
      type: 'text',
      required: true,
      isPageHeading: false,
      classes: 'govuk-!-width-full',
      maxLength: 100,
      translationKey: { label: 'labels.landlordAddressLine1' },
      errorMessage: 'errors.landlordAddressLine1.required',
      attributes: {
        autocomplete: 'address-line1',
      },
      validator: value => getTooShortErrorIfUnderMinimumCharacters(value, 'landlordAddressLine1'),
    },
    {
      name: 'landlordAddressLine2',
      type: 'text',
      required: false,
      isPageHeading: false,
      classes: 'govuk-!-width-full',
      maxLength: 100,
      translationKey: { label: 'labels.landlordAddressLine2' },
      attributes: {
        autocomplete: 'address-line2',
      },
      validator: value => getTooShortErrorIfUnderMinimumCharacters(value, 'landlordAddressLine2'),
    },
    {
      name: 'landlordPostTown',
      type: 'text',
      required: true,
      isPageHeading: false,
      classes: 'govuk-!-width-two-thirds',
      maxLength: 100,
      translationKey: { label: 'labels.landlordPostTown' },
      attributes: {
        autocomplete: 'address-level2',
      },
      validator: value => getTooShortErrorIfUnderMinimumCharacters(value, 'landlordPostTown'),
    },
    {
      name: 'landlordCounty',
      type: 'text',
      required: false,
      isPageHeading: false,
      classes: 'govuk-!-width-two-thirds',
      maxLength: 100,
      translationKey: { label: 'labels.landlordCounty' },
      attributes: {
        autocomplete: 'address-level1',
      },
      validator: value => getTooShortErrorIfUnderMinimumCharacters(value, 'landlordCounty'),
    },
    {
      name: 'landlordPostcode',
      type: 'text',
      required: false,
      isPageHeading: false,
      classes: 'govuk-!-width-one-third',
      translationKey: { label: 'labels.landlordPostcode', hint: 'hints.landlordPostcode' },
    },
    {
      name: 'landlordCountry',
      type: 'text',
      required: true,
      isPageHeading: false,
      classes: 'govuk-!-width-one-third',
      maxLength: 100,
      translationKey: { label: 'labels.landlordCountry' },
      errorMessage: 'errors.landlordCountry.required',
      attributes: {
        autocomplete: 'country',
      },
      validator: value => getTooShortErrorIfUnderMinimumCharacters(value, 'landlordCountry'),
    },
  ],

  getInitialFormData: req => {
    const caseData: PTCaseData | undefined = req.session.ccdCase;

    const landlordAddressLine1 =
      getFormDataString(req, stepName, 'landlordAddressLine1') ?? caseData?.landlordAddressLine1;
    const landlordAddressLine2 =
      getFormDataString(req, stepName, 'landlordAddressLine2') ?? caseData?.landlordAddressLine2;
    const landlordPostTown = getFormDataString(req, stepName, 'landlordPostTown') ?? caseData?.landlordPostTown;
    const landlordCounty = getFormDataString(req, stepName, 'landlordCounty') ?? caseData?.landlordCounty;
    const landlordPostcode = getFormDataString(req, stepName, 'landlordPostcode') ?? caseData?.landlordPostcode;
    const landlordCountry = getFormDataString(req, stepName, 'landlordCountry') ?? caseData?.landlordCountry;

    return {
      ...(landlordAddressLine1 && { landlordAddressLine1 }),
      ...(landlordAddressLine2 && { landlordAddressLine2 }),
      ...(landlordPostTown && { landlordPostTown }),
      ...(landlordCounty && { landlordCounty }),
      ...(landlordPostcode && { landlordPostcode }),
      ...(landlordCountry && { landlordCountry }),
    };
  },
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  return Boolean(ccdCase?.landlordAddressLine1 && ccdCase?.landlordPostTown && ccdCase?.landlordCountry);
}
