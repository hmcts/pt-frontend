import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';

const journeyName = 'application';
const stepName = 'does-the-tenancy-include-other-facilities';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/doesTheTenancyIncludeOtherFacilities.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  fields: [
    {
      name: 'propertyIncludesOtherFacilities',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: 'errors.propertyIncludesOtherFacilities.required',
      options: [
        {
          value: 'yes',
          translationKey: 'common:yes',
          subFields: {
            propertyFacilitiesDescription: {
              name: 'propertyFacilitiesDescription',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.propertyFacilitiesDescription.required',
              translationKey: { label: 'options.propertyFacilitiesDescription.label' },
              validator: (value): boolean | string => {
                if (value && String(value).length > 500) {
                  return 'errors.propertyFacilitiesDescription.invalid';
                }
                return true;
              },
            },
          },
        },
        { value: 'no', translationKey: 'common:no' },
      ],
    },
  ],
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  if (ccdCase?.propertyIncludesOtherFacilities === 'yes') {
    return Boolean(
      ccdCase?.propertyFacilitiesDescription && textAreaIsValidLength(ccdCase.propertyFacilitiesDescription)
    );
  }
  return ccdCase?.propertyIncludesOtherFacilities === 'no';
}
