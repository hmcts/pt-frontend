import { step as currentRentAndOtherCosts } from './the-current-rent-and-other-costs/current-rent-and-other-costs';
import { step as rentPaymentFrequency } from './the-current-rent-and-other-costs/rent-payment-frequency';
import { step as tribunalPreviouslyDeterminedRent } from './the-current-rent-and-other-costs/tribunal-previously-determined-rent';
import { step as proposedMarketRent } from './what-you-think-market-rent-should-be/proposed-market-rent';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const theRentStepRegistry = {
  'current-rent-and-other-costs': currentRentAndOtherCosts,
  'tribunal-previously-determined-rent': tribunalPreviouslyDeterminedRent,
  'rent-payment-frequency': rentPaymentFrequency,
  'proposed-market-rent': proposedMarketRent,
} satisfies Record<string, StepDefinition>;
