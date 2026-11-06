import { textAreaIsValidLength } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

const journeyName = 'application';
const stepName = 'your-notice-proposing-a-new-rent';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/yourNoticeProposingANewRent.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  beforeRedirect: req => {
    const stepData = getFormData(req, stepName);

    if (stepData.noticeLegallyValid !== 'No') {
      delete stepData.noticeNotLegallyValidDetails;
    }
  },
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
  },
  fields: [
    {
      name: 'noticeLegallyValid',
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.noticeLegallyValid.required',
      options: [
        { value: 'Yes', translationKey: 'common:yes' },
        {
          value: 'No',
          translationKey: 'common:no',
          subFields: {
            noticeNotLegallyValidDetails: {
              name: 'noticeNotLegallyValidDetails',
              type: 'textarea',
              maxLength: 500,
              required: false,
              translationKey: {
                label: 'options.noticeNotLegallyValidDetails.label',
                hint: 'options.noticeNotLegallyValidDetails.hint',
              },
              validator: (value): boolean | string =>
                textAreaIsValidLength(value as string) ? true : 'errors.noticeNotLegallyValidDetails.invalid',
            },
          },
        },
      ],
    },
  ],
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const noticeLegallyValid = ccdCase?.noticeOfRentIncreaseDetails?.noticeLegallyValid;
  return noticeLegallyValid === 'Yes' || noticeLegallyValid === 'No';
}
