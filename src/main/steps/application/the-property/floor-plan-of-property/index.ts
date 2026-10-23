import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

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
      name: 'propertyFloorPlanAvailable',
      type: 'radio',
      required: true,
      isPageHeading: true,
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.propertyFloorPlanAvailable.required',
      options: [
        { value: 'Yes', translationKey: 'common:yes' },
        {
          value: 'No',
          translationKey: 'common:no',
          subFields: {
            floorPlanManualDetails: {
              name: 'floorPlanManualDetails',
              type: 'textarea',
              maxLength: 500,
              required: false,
              translationKey: {
                label: 'options.floorPlanManualDetails.label',
                hint: 'options.floorPlanManualDetails.hint',
              },
              validator: (value): boolean | string => {
                if (value && String(value).length > 500) {
                  return 'errors.floorPlanManualDetails.invalid';
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
  const propertyDetails = ccdCase?.propertyDetails;

  return (
    propertyDetails?.propertyFloorPlanAvailable === 'Yes' ||
    (propertyDetails?.propertyFloorPlanAvailable === 'No' && Boolean(propertyDetails?.floorPlanManualDetails))
  );
}
