import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

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
      name: 'hearingRequested',
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.hearingRequested.required',
      options: [
        {
          value: 'Yes',
          translationKey: 'common:yes',
          subFields: {
            reasonHearingRequested: {
              name: 'reasonHearingRequested',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.reasonHearingRequested.required',
              translationKey: {
                label: 'options.reasonHearingRequested.label',
              },
              validator: (value): boolean | string =>
                textAreaIsValidLength(value as string) ? true : 'errors.reasonHearingRequested.invalid',
            },
          },
        },
        { value: 'No', translationKey: 'common:no' },
      ],
    },
  ],
  getInitialFormData: req => {
    const details = req.session.ccdCase?.hearingInspectionDetails;
    const hearingRequested = getFormDataString(req, stepName, 'hearingRequested') ?? details?.hearingRequested;
    const reasonHearingRequested =
      getFormDataString(req, stepName, 'hearingRequested.reasonHearingRequested') ?? details?.reasonHearingRequested;

    return {
      ...(hearingRequested && { hearingRequested }),
      ...(reasonHearingRequested && { 'hearingRequested.reasonHearingRequested': reasonHearingRequested }),
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
