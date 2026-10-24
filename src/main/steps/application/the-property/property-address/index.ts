import { flowConfig } from '../../flow.config';
import { getValidatedCase } from '../../section-cya/cyaRow';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';
import { isValidPostcode } from '@utils/postcode';

const journeyName = 'application';
const stepName = 'property-address';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/propertyAddress.njk`,
  showCancelButton: false,
  getInitialFormData: req => {
    const propertyDetails = getValidatedCase(req)?.propertyDetails;

    const addressLine1 = getFormDataString(req, stepName, 'addressLine1') ?? propertyDetails?.addressLine1;
    const addressLine2 = getFormDataString(req, stepName, 'addressLine2') ?? propertyDetails?.addressLine2;
    const townOrCity = getFormDataString(req, stepName, 'townOrCity') ?? propertyDetails?.townOrCity;
    const county = getFormDataString(req, stepName, 'county') ?? propertyDetails?.county;
    const postcode = getFormDataString(req, stepName, 'postcode') ?? propertyDetails?.postcode;

    return {
      ...(addressLine1 !== undefined && { addressLine1 }),
      ...(addressLine2 !== undefined && { addressLine2 }),
      ...(townOrCity !== undefined && { townOrCity }),
      ...(county !== undefined && { county }),
      ...(postcode !== undefined && { postcode }),
    };
  },
  isAnswered: req => isAnswered(getValidatedCase(req)),
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
  },
  fields: [
    {
      name: 'addressLine1',
      type: 'text',
      required: true,
      isPageHeading: false,
      translationKey: { label: 'labels.addressLine1' },
      errorMessage: 'errors.addressLine1.required',
      attributes: {
        autocomplete: 'address-line1',
      },
      validator: (value): boolean | string => {
        if (value && String(value).length < 2) {
          return 'errors.addressLine1.invalid';
        }
        return true;
      },
    },
    {
      name: 'addressLine2',
      type: 'text',
      required: false,
      isPageHeading: false,
      translationKey: { label: 'labels.addressLine2' },
      attributes: {
        autocomplete: 'address-line2',
      },
      validator: (value): boolean | string => {
        if (value && String(value).length < 2) {
          return 'errors.addressLine2.invalid';
        }
        return true;
      },
    },
    {
      name: 'townOrCity',
      type: 'text',
      required: true,
      isPageHeading: false,
      translationKey: { label: 'labels.townOrCity' },
      errorMessage: 'errors.townOrCity.required',
      attributes: {
        autocomplete: 'address-level2',
      },
      validator: (value): boolean | string => {
        if (value && String(value).length < 2) {
          return 'errors.townOrCity.invalid';
        }
        return true;
      },
    },
    {
      name: 'county',
      type: 'text',
      required: false,
      isPageHeading: false,
      translationKey: { label: 'labels.county' },
      attributes: {
        autocomplete: 'address-level1',
      },
      validator: (value): boolean | string => {
        if (value && String(value).length < 2) {
          return 'errors.county.invalid';
        }
        return true;
      },
    },
    {
      name: 'postcode',
      type: 'text',
      required: true,
      isPageHeading: false,
      translationKey: { label: 'labels.postcode' },
      errorMessage: 'errors.postcode.required',
      attributes: {
        autocomplete: 'postal-code',
      },
      validator: (value): boolean | string => {
        if (value && !isValidPostcode(value as string)) {
          return 'errors.postcode.invalid';
        }
        return true;
      },
    },
  ],
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const propertyDetails = ccdCase?.propertyDetails;
  return Boolean(propertyDetails?.addressLine1 && propertyDetails?.townOrCity && propertyDetails?.postcode);
}
