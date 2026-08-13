import { step as councilTaxFrequency } from './the-current-rent-and-other-costs/council-tax-frequency';
import { step as currentRentAndOtherCosts } from './the-current-rent-and-other-costs/current-rent-and-other-costs';
import { step as rentIncludesCouncilTax } from './the-current-rent-and-other-costs/rent-includes-council-tax';
import { step as rentInclusiveOfUtilityCharges } from './the-current-rent-and-other-costs/rent-inclusive-of-utility-charges';
import { step as rentPaymentFrequency } from './the-current-rent-and-other-costs/rent-payment-frequency';
import { step as tribunalPreviouslyDeterminedRent } from './the-current-rent-and-other-costs/tribunal-previously-determined-rent';
import { step as proposedMarketRent } from './what-you-think-market-rent-should-be/proposed-market-rent';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const theRentStepRegistry = {
  'current-rent-and-other-costs': currentRentAndOtherCosts,
  'tribunal-previously-determined-rent': tribunalPreviouslyDeterminedRent,
  'rent-payment-frequency': rentPaymentFrequency,
  'rent-includes-council-tax': rentIncludesCouncilTax,
  'council-tax-frequency': councilTaxFrequency,
  'rent-inclusive-of-utility-charges': rentInclusiveOfUtilityCharges,
  'proposed-market-rent': proposedMarketRent,
} satisfies Record<string, StepDefinition>;
