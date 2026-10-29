import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

const journeyName = 'application';
const stepName = 'do-you-share-the-property-with-landlord';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/doYouShareThePropertyWithLandlord.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  fields: [
    {
      name: 'propertySharedWithLandlord',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: 'errors.propertySharedWithLandlord.required',
      options: [
        {
          value: 'Yes',
          translationKey: 'common:yes',
          subFields: {
            propertySharedWithLandlordDetails: {
              name: 'propertySharedWithLandlordDetails',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.propertySharedWithLandlordDetails.required',
              translationKey: { label: 'options.propertySharedWithLandlordDetails.label' },
              validator: (value): boolean | string => {
                if (value && String(value).length > 500) {
                  return 'errors.propertySharedWithLandlordDetails.invalid';
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

  if (propertyDetails?.propertySharedWithLandlord === 'Yes') {
    return Boolean(
      propertyDetails?.propertySharedWithLandlordDetails &&
      textAreaIsValidLength(propertyDetails.propertySharedWithLandlordDetails)
    );
  }
  return ccdCase?.propertySharedWithLandlord === 'No';
}
