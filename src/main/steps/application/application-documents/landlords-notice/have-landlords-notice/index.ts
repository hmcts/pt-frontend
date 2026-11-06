import { textAreaIsValidLength } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

const journeyName = 'application';
const stepName = 'have-landlords-notice';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/receivedLandlordNoticeProposingNewRent.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: {
    pageTitle: 'pageTitle',
  },
  fields: [
    {
      name: 'receivedLandlordNoticeProposingNewRent',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'heading' },
      errorMessage: 'errors.receivedLandlordNoticeProposingNewRent.required',
      options: [
        { value: 'Yes', translationKey: 'common:yes' },
        {
          value: 'No',
          translationKey: 'common:no',
          subFields: {
            noUploadOfNoticeProposingNewRentReason: {
              name: 'noUploadOfNoticeProposingNewRentReason',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.noUploadOfNoticeProposingNewRentReason.required',
              translationKey: {
                label: 'options.noUploadOfNoticeProposingNewRentReason.label',
              },
              validator: (value): boolean | string => {
                if (!textAreaIsValidLength(value as string)) {
                  return 'errors.noUploadOfNoticeProposingNewRentReason.invalidMaxLength';
                }

                if (value && String(value).length < 2) {
                  return 'errors.noUploadOfNoticeProposingNewRentReason.invalidMinLength';
                }

                return true;
              },
            },
          },
        },
      ],
    },
  ],
  getInitialFormData: req => {
    const caseData: PTCaseData | undefined = req.session.ccdCase;
    const receivedLandlordNoticeProposingNewRent: string | boolean | undefined =
      getFormDataString(req, 'have-landlords-notice', 'receivedLandlordNoticeProposingNewRent') ??
      caseData?.noticeOfRentIncreaseDetails?.receivedLandlordNoticeProposingNewRent;
    const noUploadOfNoticeProposingNewRentReason: string | undefined =
      getFormDataString(
        req,
        'have-landlords-notice',
        'receivedLandlordNoticeProposingNewRent.noUploadOfNoticeProposingNewRentReason'
      ) ?? caseData?.noticeOfRentIncreaseDetails?.noUploadOfNoticeProposingNewRentReason;

    return {
      ...(receivedLandlordNoticeProposingNewRent && { receivedLandlordNoticeProposingNewRent }),
      ...(noUploadOfNoticeProposingNewRentReason && {
        'receivedLandlordNoticeProposingNewRent.noUploadOfNoticeProposingNewRentReason':
          noUploadOfNoticeProposingNewRentReason,
      }),
    };
  },
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
