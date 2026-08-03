import { step as landlordEmailAddress } from './landlord-email-address';
import { step as landlordHasLettingAgentOrRepresentative } from './landlord-has-letting-agent-or-representative';
import { step as landlordName } from './landlord-name';
import { step as landlordPhoneNumber } from './landlord-phone-number';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const landlordDetailsStepRegistry = {
  'landlord-name': landlordName,
  'landlord-email-address': landlordEmailAddress,
  'landlord-phone-number': landlordPhoneNumber,
  'landlord-has-letting-agent-or-representative': landlordHasLettingAgentOrRepresentative,
} satisfies Record<string, StepDefinition>;
