import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';

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
        { value: 'yes', translationKey: 'common:yes' },
        {
          value: 'no',
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
              validator: (value): boolean | string => {
                if (value && String(value).length > 500) {
                  return 'errors.noDecisionWithoutHearingReason.invalid';
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

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  if (ccdCase?.agreeToDecisionWithoutHearing === 'no') {
    return Boolean(
      ccdCase?.noDecisionWithoutHearingReason &&
      textAreaIsValidLength(ccdCase?.noDecisionWithoutHearingReason as string)
    );
  }
  return ccdCase?.agreeToDecisionWithoutHearing === 'yes';
}
