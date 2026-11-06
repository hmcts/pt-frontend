import { flowConfig } from '../../flow.config';

import { createFormStep, getFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

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
        ccdCase?.propertyDetails?.postTown,
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
            },
            addressLine2: {
              name: 'addressLine2',
              type: 'text',
              required: false,
              isPageHeading: false,
              translationKey: { label: 'labels.addressLine2' },
            },
            postTown: {
              name: 'postTown',
              type: 'text',
              required: true,
              isPageHeading: false,
              translationKey: { label: 'labels.postTown' },
              errorMessage: 'errors.postTown.required',
            },
            postcode: {
              name: 'postcode',
              type: 'text',
              required: true,
              isPageHeading: false,
              translationKey: { label: 'labels.postcode' },
              errorMessage: 'errors.postcode.required',
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
