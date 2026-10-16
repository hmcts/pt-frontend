import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import type { PTCaseData } from '@services/ccdCase.interface';
import { isValidPersonName } from '@utils/personName';

const journeyName = 'application';
const stepName = 'landlord-letting-agent-details';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordLettingAgentDetails.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  fields: [
    {
      name: 'lettingAgentFirstName',
      type: 'text',
      required: true,
      isPageHeading: false,
      maxLength: 100,
      translationKey: { label: 'labels.lettingAgentFirstName' },
      errorMessage: 'errors.lettingAgentFirstName.required',
      attributes: {
        autocomplete: 'given-name',
      },
      validator: (value): boolean | string => {
        if (value && String(value).length < 2) {
          return 'errors.lettingAgentFirstName.invalidMinLength';
        }
        if (value && !isValidPersonName(value as string)) {
          return 'errors.lettingAgentFirstName.invalidCharacters';
        }
        if (value && String(value).length > 100) {
          return 'errors.lettingAgentFirstName.invalidMaxLength';
        }
        return true;
      },
    },
    {
      name: 'lettingAgentLastName',
      type: 'text',
      required: true,
      isPageHeading: false,
      maxLength: 100,
      translationKey: { label: 'labels.lettingAgentLastName' },
      errorMessage: 'errors.lettingAgentLastName.required',
      attributes: {
        autocomplete: 'family-name',
      },
      validator: (value): boolean | string => {
        if (value && String(value).length < 2) {
          return 'errors.lettingAgentLastName.invalidMinLength';
        }
        if (value && !isValidPersonName(value as string)) {
          return 'errors.lettingAgentLastName.invalidCharacters';
        }
        if (value && String(value).length > 100) {
          return 'errors.lettingAgentLastName.invalidMaxLength';
        }
        return true;
      },
    },
    {
      name: 'lettingAgentCompanyName',
      type: 'text',
      required: false,
      isPageHeading: false,
      maxLength: 100,
      translationKey: { label: 'labels.lettingAgentCompanyName' },
      validator: (value): boolean | string => {
        if (value && String(value).length > 100) {
          return 'errors.lettingAgentCompanyName.invalidMaxLength';
        }
        return true;
      },
    },
    {
      name: 'lettingAgentDXNumber',
      type: 'text',
      required: false,
      isPageHeading: false,
      translationKey: { label: 'labels.lettingAgentDXNumber.label', hint: 'labels.lettingAgentDXNumber.hint' },
    },
  ],
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  return Boolean(ccdCase?.landlordLettingAgentFirstName && ccdCase?.landlordLettingAgentLastName);
}
