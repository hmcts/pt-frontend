import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { CcdCaseData } from '@services/ccdCase.interface';
import { isValidPhoneNumber } from '@utils/phoneNumber';

const journeyName = 'application';
const stepName = 'text-updates';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/textUpdates.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  fields: [
    {
      name: 'textUpdates',
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.textUpdates.required',
      options: [
        {
          value: 'yes',
          translationKey: 'common:yes',
          subFields: {
            textUpdatesPhoneNumber: {
              name: 'textUpdatesPhoneNumber',
              type: 'text',
              maxLength: 20,
              required: true,
              errorMessage: 'errors.textUpdatesPhoneNumber.required',
              classes: 'govuk-input--width-10',
              translationKey: {
                label: 'options.yesTextBox.label',
              },
              validator: (value): boolean | string => {
                if (value && !isValidPhoneNumber(value as string)) {
                  return 'errors.textUpdatesPhoneNumber.invalid';
                }
                return true;
              },
            },
          },
        },
        { value: 'no', translationKey: 'options.no.label' },
      ],
    },
  ],
});

function isAnswered(ccdCase: CcdCaseData): boolean {
  if (ccdCase.textUpdates === 'yes') {
    return Boolean(ccdCase.textUpdatesPhoneNumber && isValidPhoneNumber(ccdCase.textUpdatesPhoneNumber as string));
  }
  return ccdCase.textUpdates === 'no';
}
