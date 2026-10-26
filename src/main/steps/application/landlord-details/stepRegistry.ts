import { step as checkYourAnswersLandlordDetails } from './check-your-answers-landlord-details';
import { step as landlordAddress } from './landlord-address';
import { step as landlordEmailAddress } from './landlord-email-address';
import { step as landlordHasLettingAgentOrRepresentative } from './landlord-has-letting-agent-or-representative';
import { step as landlordIndividualOrOrganisation } from './landlord-individual-or-organisation';
import { step as landlordLettingAgentEmailAddress } from './landlord-letting-agent-email-address';
import { step as landlordLettingAgentPhoneNumber } from './landlord-letting-agent-phone-number';
import { step as landlordPhoneNumber } from './landlord-phone-number';
import { step as landlordRepresentativeDetails } from './landlord-representative-details';
import { step as landlordRepresentativeEmailAddress } from './landlord-representative-email-address';
import { step as landlordRepresentativePhoneNumber } from './landlord-representative-phone-number';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const landlordDetailsStepRegistry = {
  'landlord-individual-or-organisation': landlordIndividualOrOrganisation,
  'landlord-address': landlordAddress,
  'landlord-email-address': landlordEmailAddress,
  'landlord-phone-number': landlordPhoneNumber,
  'landlord-has-letting-agent-or-representative': landlordHasLettingAgentOrRepresentative,
  'landlord-letting-agent-email-address': landlordLettingAgentEmailAddress,
  'landlord-letting-agent-phone-number': landlordLettingAgentPhoneNumber,
  'landlord-representative-details': landlordRepresentativeDetails,
  'landlord-representative-email-address': landlordRepresentativeEmailAddress,
  'landlord-representative-phone-number': landlordRepresentativePhoneNumber,
  'check-your-answers-landlord-details': checkYourAnswersLandlordDetails,
} satisfies Record<string, StepDefinition>;
