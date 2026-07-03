import { step as addressOfProperty } from './address-of-property';
import { step as applyingForYourselfOrSomeoneElse } from './applying-for-yourself-or-someone-else';
import { step as landlordIsAHousingAssociation } from './landlord-is-a-housing-association';
import { step as startingOrReturning } from './starting-or-returning';
import { step as youNeedToUseAnotherForm } from './you-need-to-use-another-form';
import { step as youNeedToUseAnotherFormPostcode } from './you-need-to-use-another-form-postcode';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const stepRegistry = {
  'starting-or-returning': startingOrReturning,
  'applying-for-yourself-or-someone-else': applyingForYourselfOrSomeoneElse,
  'you-need-to-use-another-form': youNeedToUseAnotherForm,
  'address-of-property': addressOfProperty,
  'you-need-to-use-another-form-postcode': youNeedToUseAnotherFormPostcode,
  'landlord-is-a-housing-association': landlordIsAHousingAssociation,
} satisfies Record<string, StepDefinition>;

export type RespondToClaimStepName = keyof typeof stepRegistry;
