import { textAreaIsValidLength } from '../../../../utils/fieldValidators';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';
import { flowConfig } from 'steps/application/flow.config';

const journeyName = 'application';
const stepName = 'have-landlords-notice';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/haveLandlordsNotice.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: {
    pageTitle: 'pageTitle',
  },
  fields: [
    {
      name: 'haveLandlordsNotice',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'heading' },
      errorMessage: 'errors.haveLandlordsNotice.required',
      options: [
        { value: 'Yes', translationKey: 'common:yes' },
        {
          value: 'No',
          translationKey: 'common:no',
          subFields: {
            noLandlordsNoticeReason: {
              name: 'noLandlordsNoticeReason',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.noLandlordsNoticeReason.required',
              translationKey: {
                label: 'options.noLandlordsNoticeReason.label',
              },
              validator: (value): boolean | string => {
                if (!textAreaIsValidLength(value as string)) {
                  return 'errors.noLandlordsNoticeReason.invalidMaxLength';
                }

                if (value && String(value).length < 2) {
                  return 'errors.noLandlordsNoticeReason.invalidMinLength';
                }

                return true;
              },
            },
          },
        },
      ],
    },
  ],
});

export function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const landlordNoticeDetails = ccdCase?.noticeOfRentIncreaseDetails;
  if (!landlordNoticeDetails) {
    return false;
  }

  const { receivedLandlordNoticeProposingNewRent, noUploadOfNoticeProposingNewRentReason } = landlordNoticeDetails;
  if (receivedLandlordNoticeProposingNewRent === 'No') {
    return Boolean(
      noUploadOfNoticeProposingNewRentReason &&
      textAreaIsValidLength(noUploadOfNoticeProposingNewRentReason) &&
      noUploadOfNoticeProposingNewRentReason.length >= 2
    );
  }
  return receivedLandlordNoticeProposingNewRent === 'Yes';
}
