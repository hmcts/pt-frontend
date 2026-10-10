import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';
import { isValidPostcode } from '@utils/postcode';

const journeyName = 'application';
const stepName = 'landlord-letting-agent-address';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordLettingAgentAddress.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
  },
  fields: [
    {
      name: 'lettingAgentAddressLine1',
      type: 'text',
      required: true,
      isPageHeading: false,
      translationKey: { label: 'labels.lettingAgentAddressLine1' },
      errorMessage: 'errors.lettingAgentAddressLine1.required',
      validator: (value): boolean | string => {
        if (value && String(value).length < 2) {
          return 'errors.lettingAgentAddressLine1.invalid';
        }
        return true;
      },
    },
    {
      name: 'lettingAgentAddressLine2',
      type: 'text',
      required: false,
      isPageHeading: false,
      translationKey: { label: 'labels.lettingAgentAddressLine2' },
      validator: (value): boolean | string => {
        if (value && String(value).length < 2) {
          return 'errors.lettingAgentAddressLine2.invalid';
        }
        return true;
      },
    },
    {
      name: 'lettingAgentTownOrCity',
      type: 'text',
      required: true,
      isPageHeading: false,
      translationKey: { label: 'labels.lettingAgentTownOrCity' },
      errorMessage: 'errors.lettingAgentTownOrCity.required',
      validator: (value): boolean | string => {
        if (value && String(value).length < 2) {
          return 'errors.lettingAgentTownOrCity.invalid';
        }
        return true;
      },
    },
    {
      name: 'county',
      type: 'text',
      required: false,
      isPageHeading: false,
      translationKey: { label: 'labels.lettingAgentCounty' },
      validator: (value): boolean | string => {
        if (value && String(value).length < 2) {
          return 'errors.lettingAgentCounty.invalid';
        }
        return true;
      },
    },
    {
      name: 'lettingAgentPostcode',
      type: 'text',
      required: true,
      isPageHeading: false,
      translationKey: { label: 'labels.lettingAgentPostcode' },
      errorMessage: 'errors.lettingAgentPostcode.required',
      validator: (value): boolean | string => {
        if (value && !isValidPostcode(value as string)) {
          return 'errors.lettingAgentPostcode.invalid';
        }
        return true;
      },
    },
  ],
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  return Boolean(
    ccdCase?.landlordLettingAgentAddressLine1 &&
    ccdCase?.landlordLettingAgentTownOrCity &&
    ccdCase?.landlordLettingAgentPostcode
  );
}
