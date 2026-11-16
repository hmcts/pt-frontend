import { flowConfig } from '../../flow.config';

import { createFormStep, getFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';
import { isValidPostcode } from '@utils/postcode';

const journeyName = 'landlord-response';
const stepName = 'property-address';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/propertyAddress.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  beforeRedirect: req => {
    const stepData = getFormData(req, stepName);
    if (stepData.tenantProvidedCorrectAddress === 'No') {
      return;
    }
    delete stepData['tenantProvidedCorrectAddress.addressLine1'];
    delete stepData['tenantProvidedCorrectAddress.addressLine2'];
    delete stepData['tenantProvidedCorrectAddress.county'];
    delete stepData['tenantProvidedCorrectAddress.postTown'];
    delete stepData['tenantProvidedCorrectAddress.postcode'];
  },
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
  },
  extendGetContent: req => {
    const ccdCase = req.session.ccdCase;
    return {
      tenantPropertyHtml: [
        ccdCase?.propertyDetails?.addressLine1,
        ccdCase?.propertyDetails?.addressLine2,
        ccdCase?.propertyDetails?.postTown,
        ccdCase?.propertyDetails?.county,
        ccdCase?.propertyDetails?.postcode,
      ]
        .filter(Boolean)
        .join('<br>'),
    };
  },
  fields: [
    {
      name: 'tenantProvidedCorrectAddress',
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'question' },
      errorMessage: 'errors.tenantProvidedCorrectAddress.required',
      options: [
        { value: 'Yes', translationKey: 'common:yes' },
        {
          value: 'No',
          translationKey: 'common:no',
          conditionalText: 'correctAddressHint',
          subFields: {
            addressLine1: {
              name: 'addressLine1',
              type: 'text',
              required: true,
              isPageHeading: false,
              translationKey: { label: 'labels.addressLine1' },
              errorMessage: 'errors.addressLine1.required',
              labelClasses: 'govuk-!-margin-top-4',
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
            addressLine2: {
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
            postTown: {
              name: 'postTown',
              type: 'text',
              required: true,
              isPageHeading: false,
              translationKey: { label: 'labels.postTown' },
              errorMessage: 'errors.postTown.required',
              attributes: {
                autocomplete: 'address-level2',
              },
              validator: (value): boolean | string => {
                if (value && String(value).length < 2) {
                  return 'errors.postTown.invalid';
                }
                return true;
              },
            },
            county: {
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
            postcode: {
              name: 'postcode',
              type: 'text',
              required: true,
              isPageHeading: false,
              translationKey: { label: 'labels.postcode' },
              errorMessage: 'errors.postcode.required',
              validator: (value): boolean | string => {
                if (value && !isValidPostcode(value as string)) {
                  return 'errors.postcode.invalid';
                }
                return true;
              },
            },
          },
        },
      ],
    },
  ],
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const propertyAddress = ccdCase?.landlordResponse?.propertyAddress;
  if (propertyAddress?.tenantProvidedCorrectAddress === 'No') {
    return Boolean(propertyAddress?.addressLine1 && propertyAddress?.postTown && propertyAddress?.postcode);
  }
  return propertyAddress?.tenantProvidedCorrectAddress === 'Yes';
}
