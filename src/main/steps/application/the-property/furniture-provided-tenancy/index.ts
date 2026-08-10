import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { CcdCaseData } from '@services/ccdCase.interface';

const journeyName = 'application';
const stepName = 'furniture-provided-tenancy';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/furnitureProvidedTenancy.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  fields: [
    {
      name: 'furnitureProvided',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.furnitureProvided.required',
      options: [
        {
          value: 'yes',
          translationKey: 'common:yes',
          subFields: {
            furnitureProvidedDetails: {
              name: 'furnitureProvidedDetails',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.furnitureProvidedDetails.required',
              translationKey: {
                label: 'options.furnitureProvidedDetails.label',
                hint: 'options.furnitureProvidedDetails.hint',
              },
              validator: (value): boolean | string => {
                if (value && (String(value).length < 2 || String(value).length > 500)) {
                  return 'errors.furnitureProvidedDetails.invalid';
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

function isAnswered(ccdCase: CcdCaseData): boolean {
  if (ccdCase.furnitureProvided === 'yes') {
    return Boolean(
      ccdCase.furnitureProvidedDetails && textAreaIsValidLength(ccdCase.furnitureProvidedDetails as string)
    );
  }
  return ccdCase.furnitureProvided === 'no';
}
