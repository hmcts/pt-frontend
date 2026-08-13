import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';
import { VALID_MOBILE_NUMBER_REGEX, isValidPhoneNumber } from '@utils/phoneNumber';

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
          value: 'Yes',
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
                if (value && !isValidPhoneNumber(value as string, VALID_MOBILE_NUMBER_REGEX)) {
                  return 'errors.textUpdatesPhoneNumber.invalid';
                }
                return true;
              },
            },
          },
        },
        { value: 'No', translationKey: 'options.no.label' },
      ],
    },
  ],
  getInitialFormData: req => {
    const formData = req.session.formData;
    const caseData: PTCaseData | undefined = req.session.ccdCase;
    const textUpdates: string | undefined =
      formData?.['text-updates']?.textUpdates ?? caseData?.applicantContactPreferences?.contactByText;
    const textUpdatesPhoneNumber: string | undefined =
      formData?.['text-updates']?.['textUpdates.textUpdatesPhoneNumber'] ??
      caseData?.applicantContactPreferences?.mobilePhoneNumber;

    return {
      ...(textUpdates && { textUpdates }),
      ...(textUpdatesPhoneNumber && { 'textUpdates.textUpdatesPhoneNumber': textUpdatesPhoneNumber }),
    };
  },
});

export function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  if (ccdCase?.applicantContactPreferences?.contactByText === 'Yes') {
    return Boolean(
      ccdCase?.applicantContactPreferences?.mobilePhoneNumber &&
      isValidPhoneNumber(ccdCase?.applicantContactPreferences?.mobilePhoneNumber as string, VALID_MOBILE_NUMBER_REGEX)
    );
  }
  return ccdCase?.applicantContactPreferences?.contactByText === 'No';
}
