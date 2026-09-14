import { flowConfig } from '../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'preApplication';
const stepName = 'you-need-to-use-another-form-postcode';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/youNeedToUseAnotherFormPostcode.njk`,
  showCancelButton: false,
  fields: [],
  extendGetContent: req => {
    const postcode = getFormDataString(req, 'address-of-property', 'addressPostcode');
    return {
      postcode,
    };
  },
});
