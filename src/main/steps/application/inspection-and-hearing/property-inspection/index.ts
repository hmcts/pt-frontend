import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { CcdCaseData } from '@services/ccdCase.interface';

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
        { value: 'yes', translationKey: 'common:yes' },
        {
          value: 'no',
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
              validator: (value): boolean | string => {
                if (value && String(value).length > 500) {
                  return 'errors.noDecisionWithoutInspectionReason.invalid';
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

function isAnswered(ccdCase: CcdCaseData): boolean {
  if (ccdCase.agreeToDecisionWithoutInspection === 'no') {
    return Boolean(
      (ccdCase.noDecisionWithoutInspectionReason as string) &&
      textAreaIsValidLength(ccdCase.noDecisionWithoutInspectionReason as string)
    );
  }
  return ccdCase.agreeToDecisionWithoutInspection === 'yes';
}
