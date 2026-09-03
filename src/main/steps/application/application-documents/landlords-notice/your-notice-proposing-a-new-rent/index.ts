import { textAreaIsValidLength } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { CcdCaseData } from '@services/ccdCase.interface';

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
    const stepData = req.session.formData?.[stepName];

    if (!stepData) {
      return;
    }

    if (stepData.noticeLegallyValid !== 'no') {
      delete stepData.noticeNotLegallyValidReason;
    }
  },
  translationKeys: {
    pageTitle: 'pageTitle',
  },
  fields: [
    {
      name: 'noticeLegallyValid',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.noticeLegallyValid.required',
      options: [
        { value: 'yes', translationKey: 'common:yes' },
        {
          value: 'no',
          translationKey: 'common:no',
          subFields: {
            noticeNotLegallyValidReason: {
              name: 'noticeNotLegallyValidReason',
              type: 'textarea',
              maxLength: 500,
              required: false,
              translationKey: {
                label: 'options.noticeNotLegallyValidReason.label',
                hint: 'options.noticeNotLegallyValidReason.hint',
              },
              validator: (value): boolean | string =>
                textAreaIsValidLength(value as string) ? true : 'errors.noticeNotLegallyValidReason.invalid',
            },
          },
        },
      ],
    },
  ],
});

function isAnswered(ccdCase: CcdCaseData): boolean {
  return ccdCase.noticeLegallyValid === 'yes' || ccdCase.noticeLegallyValid === 'no';
}
