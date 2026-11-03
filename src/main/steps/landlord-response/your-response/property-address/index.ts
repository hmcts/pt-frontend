import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'landlord-response';
const stepName = 'property-address';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/propertyAddress.njk`,
  showCancelButton: false,
  isAnswered: () => false,
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
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
        { value: 'yes', translationKey: 'common:yes' },
        {
          value: 'no',
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
            townCity: {
              name: 'townCity',
              type: 'text',
              required: true,
              isPageHeading: false,
              translationKey: { label: 'labels.townOrCity' },
              errorMessage: 'errors.townOrCity.required',
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
