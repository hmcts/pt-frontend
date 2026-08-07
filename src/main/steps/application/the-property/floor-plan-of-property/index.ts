import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { CcdCaseData } from '@services/ccdCase.interface';

const journeyName = 'application';
const stepName = 'floor-plan-of-property';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/floorPlanOfProperty.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  fields: [
    {
      name: 'hasFloorPlanOfProperty',
      type: 'radio',
      required: true,
      isPageHeading: true,
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.hasFloorPlanOfProperty.required',
      options: [
        { value: 'yes', translationKey: 'common:yes' },
        {
          value: 'no',
          translationKey: 'common:no',
          subFields: {
            propertyLayoutDescription: {
              name: 'propertyLayoutDescription',
              type: 'textarea',
              maxLength: 500,
              required: false,
              translationKey: {
                label: 'options.propertyLayoutDescription.label',
                hint: 'options.propertyLayoutDescription.hint',
              },
              validator: (value): boolean | string => {
                if (value && String(value).length > 500) {
                  return 'errors.propertyLayoutDescription.invalid';
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
  const { hasFloorPlanOfProperty, propertyLayoutDescription } = ccdCase;
  return hasFloorPlanOfProperty === 'yes' || (hasFloorPlanOfProperty === 'no' && Boolean(propertyLayoutDescription));
}
