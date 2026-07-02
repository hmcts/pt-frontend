// import { step as correspondenceAddress } from './correspondence-address';
// import { step as defendantDateOfBirth } from './defendant-date-of-birth';
// import { step as freeLegalAdvice } from './free-legal-advice';
import { step as startingOrReturning } from './starting-or-returning';


import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const stepRegistry = {
  'starting-or-returning': startingOrReturning,
  'applying-form-yourself-or-someone-else': startingOrReturning,
  // 'address-of-property': freeLegalAdvice,
  // 'landlord-is-a-housing-association': defendantDateOfBirth,
} satisfies Record<string, StepDefinition>;

export type RespondToClaimStepName = keyof typeof stepRegistry;
