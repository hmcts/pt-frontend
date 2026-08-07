import { step as addressOfProperty } from './address-of-property';
import { step as applicationType } from './application-type';
import { step as applyingForYourselfOrSomeoneElse } from './applying-for-yourself-or-someone-else';
import { step as landlordIsAHousingAssociation } from './landlord-is-a-housing-association';
import { step as onlyChallengingValidityOfLandlordNotice } from './only-challenging-validity-of-landlord-notice';
import { step as startingOrReturning } from './starting-or-returning';
import { step as whoIsNamedOnYourTenancyAgreement } from './who-is-named-on-your-tenancy-agreement';
import { step as youNeedToUseAnotherForm } from './you-need-to-use-another-form';
import { step as youNeedToUseAnotherFormPostcodeJointTenant } from './you-need-to-use-another-form-joint-tenant';
import { step as youNeedToUseAnotherFormLandlordAssociation } from './you-need-to-use-another-form-landlord-association';
import { step as youNeedToUseAnotherFormNonEnglishAddress } from './you-need-to-use-another-form-non-english-address';
import { step as youNeedToUseAnotherFormPostcode } from './you-need-to-use-another-form-postcode';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const stepRegistry = {
  'starting-or-returning': startingOrReturning,
  'applying-for-yourself-or-someone-else': applyingForYourselfOrSomeoneElse,
  'you-need-to-use-another-form': youNeedToUseAnotherForm,
  'address-of-property': addressOfProperty,
  'you-need-to-use-another-form-postcode': youNeedToUseAnotherFormPostcode,
  'you-need-to-use-another-form-non-english-address': youNeedToUseAnotherFormNonEnglishAddress,
  'landlord-is-a-housing-association': landlordIsAHousingAssociation,
  'you-need-to-use-another-form-landlord-association': youNeedToUseAnotherFormLandlordAssociation,
  'application-type': applicationType,
  'only-challenging-validity-of-landlord-notice': onlyChallengingValidityOfLandlordNotice,
  'who-is-named-on-your-tenancy-agreement': whoIsNamedOnYourTenancyAgreement,
  'you-need-to-use-another-form-joint-tenant': youNeedToUseAnotherFormPostcodeJointTenant,
} satisfies Record<string, StepDefinition>;

export type RespondToClaimStepName = keyof typeof stepRegistry;
