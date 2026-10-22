import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';
import { invertYesNo } from '@utils/yesNo';

const journeyName = 'application';
const stepName = 'hearing';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/hearing.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  fields: [
    {
      name: 'agreeToDecisionWithoutHearing',
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.agreeToDecisionWithoutHearing.required',
      options: [
        { value: 'Yes', translationKey: 'common:yes' },
        {
          value: 'No',
          translationKey: 'common:no',
          subFields: {
            noDecisionWithoutHearingReason: {
              name: 'noDecisionWithoutHearingReason',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.noDecisionWithoutHearingReason.required',
              translationKey: {
                label: 'options.noDecisionWithoutHearingReason.label',
              },
              validator: (value): boolean | string =>
                textAreaIsValidLength(value as string) ? true : 'errors.noDecisionWithoutHearingReason.invalid',
            },
          },
        },
      ],
    },
  ],
  getInitialFormData: req => {
    const details = req.session.ccdCase?.hearingInspectionDetails;
    const agreeToDecisionWithoutHearing =
      getFormDataString(req, stepName, 'agreeToDecisionWithoutHearing') ?? invertYesNo(details?.hearingRequested);
    const noDecisionWithoutHearingReason =
      getFormDataString(req, stepName, 'agreeToDecisionWithoutHearing.noDecisionWithoutHearingReason') ??
      details?.reasonHearingRequested;

    return {
      ...(agreeToDecisionWithoutHearing && { agreeToDecisionWithoutHearing }),
      ...(noDecisionWithoutHearingReason && {
        'agreeToDecisionWithoutHearing.noDecisionWithoutHearingReason': noDecisionWithoutHearingReason,
      }),
    };
  },
});

export function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const details = ccdCase?.hearingInspectionDetails;
  if (details?.hearingRequested === 'Yes') {
    return Boolean(details.reasonHearingRequested && textAreaIsValidLength(details.reasonHearingRequested));
  }
  return details?.hearingRequested === 'No';
}
