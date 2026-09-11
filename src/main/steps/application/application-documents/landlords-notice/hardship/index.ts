import { textAreaIsValidLength } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';

const journeyName = 'application';
const stepName = 'hardship';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/hardship.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  beforeRedirect: req => {
    const stepData = req.session.formData?.[stepName];

    if (!stepData) {
      return;
    }

    if (stepData.rentIncreaseCauseHardship !== 'yes') {
      delete stepData.rentIncreaseHardshipDetails;
    }
  },
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
  },
  fields: [
    {
      name: 'rentIncreaseCauseHardship',
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.rentIncreaseCauseHardship.required',
      options: [
        {
          value: 'yes',
          translationKey: 'common:yes',
          subFields: {
            rentIncreaseHardshipDetails: {
              name: 'rentIncreaseHardshipDetails',
              type: 'textarea',
              maxLength: 500,
              required: false,
              translationKey: {
                label: 'options.rentIncreaseHardshipDetails.label',
                hint: 'options.rentIncreaseHardshipDetails.hint',
              },
              validator: (value): boolean | string =>
                textAreaIsValidLength(value as string) ? true : 'errors.rentIncreaseHardshipDetails.invalid',
            },
          },
        },
        { value: 'no', translationKey: 'common:no' },
      ],
    },
  ],
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  return ccdCase?.rentIncreaseCauseHardship === 'yes' || ccdCase?.rentIncreaseCauseHardship === 'no';
}
