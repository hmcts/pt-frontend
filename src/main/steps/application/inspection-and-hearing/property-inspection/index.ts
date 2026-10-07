import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';

const journeyName = 'application';
const stepName = 'property-inspection';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/propertyInspection.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  fields: [
    {
      name: 'agreeToDecisionWithoutInspection',
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.agreeToDecisionWithoutInspection.required',
      options: [
        { value: 'Yes', translationKey: 'common:yes' },
        {
          value: 'No',
          translationKey: 'common:no',
          subFields: {
            noDecisionWithoutInspectionReason: {
              name: 'noDecisionWithoutInspectionReason',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.noDecisionWithoutInspectionReason.required',
              translationKey: {
                label: 'options.noDecisionWithoutInspectionReason.label',
                hint: 'options.noDecisionWithoutInspectionReason.hint',
              },
              validator: (value): boolean | string =>
                textAreaIsValidLength(value as string) ? true : 'errors.noDecisionWithoutInspectionReason.invalid',
            },
          },
        },
      ],
    },
  ],
  getInitialFormData: req => {
    const details = req.session.ccdCase?.hearingInspectionDetails;
    const agreeToDecisionWithoutInspection =
      getFormDataString(req, stepName, 'agreeToDecisionWithoutInspection') ?? details?.agreeToDecisionWithoutInspection;
    const noDecisionWithoutInspectionReason =
      getFormDataString(req, stepName, 'agreeToDecisionWithoutInspection.noDecisionWithoutInspectionReason') ??
      details?.noDecisionWithoutInspectionReason;

    return {
      ...(agreeToDecisionWithoutInspection && { agreeToDecisionWithoutInspection }),
      ...(noDecisionWithoutInspectionReason && {
        'agreeToDecisionWithoutInspection.noDecisionWithoutInspectionReason': noDecisionWithoutInspectionReason,
      }),
    };
  },
});

export function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const details = ccdCase?.hearingInspectionDetails;
  if (details?.agreeToDecisionWithoutInspection === 'No') {
    return Boolean(
      details.noDecisionWithoutInspectionReason && textAreaIsValidLength(details.noDecisionWithoutInspectionReason)
    );
  }
  return details?.agreeToDecisionWithoutInspection === 'Yes';
}
