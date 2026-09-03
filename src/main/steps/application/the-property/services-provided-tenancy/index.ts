import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';

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
      name: 'servicesProvided',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: 'errors.servicesProvided.required',
      options: [
        {
          value: 'yes',
          translationKey: 'common:yes',
          subFields: {
            servicesProvidedDetails: {
              name: 'servicesProvidedDetails',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.servicesProvidedDetails.required',
              translationKey: {
                label: 'options.servicesProvidedDetails.label',
              },
              validator: (value): boolean | string => {
                if (value && (String(value).length < 2 || String(value).length > 500)) {
                  return 'errors.servicesProvidedDetails.invalid';
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
  if (ccdCase?.servicesProvided === 'yes') {
    return Boolean(
      ccdCase?.servicesProvidedDetails && textAreaIsValidLength(ccdCase?.servicesProvidedDetails as string)
    );
  }
  return ccdCase?.servicesProvided === 'no';
}
