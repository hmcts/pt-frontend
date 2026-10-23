import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

const journeyName = 'application';
const stepName = 'services-provided-tenancy';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/servicesProvidedTenancy.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  fields: [
    {
      name: 'additionalServicesProvidedInTenancy',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: 'errorsadditionalServicesProvidedInTenancy.required',
      options: [
        {
          value: 'Yes',
          translationKey: 'common:yes',
          subFields: {
            additionalServicesProvidedInTenancyDetails: {
              name: 'additionalServicesProvidedInTenancyDetails',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.additionalServicesProvidedInTenancyDetails.required',
              translationKey: {
                label: 'options.additionalServicesProvidedInTenancyDetails.label',
              },
              validator: (value): boolean | string => {
                if (value && (String(value).length < 2 || String(value).length > 500)) {
                  return 'errors.additionalServicesProvidedInTenancyDetails.invalid';
                }
                return true;
              },
            },
          },
        },
        { value: 'No', translationKey: 'common:no' },
      ],
    },
  ],
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const propertyDetails = ccdCase?.propertyDetails;

  if (propertyDetails?.additionalServicesProvidedInTenancy === 'Yes') {
    return Boolean(
      propertyDetails?.additionalServicesProvidedInTenancyDetails &&
      textAreaIsValidLength(propertyDetails?.additionalServicesProvidedInTenancyDetails as string)
    );
  }
  return propertyDetails?.additionalServicesProvidedInTenancy === 'No';
}
