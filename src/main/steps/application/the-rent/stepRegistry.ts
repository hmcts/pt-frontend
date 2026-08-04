import { step as currentRentAndOtherCosts } from './the-current-rent-and-other-costs/current-rent-and-other-costs';
import { step as rentFrequency } from './the-current-rent-and-other-costs/rent-frequency';
import { step as proposedMarketRent } from './what-you-think-market-rent-should-be/proposed-market-rent';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const theRentStepRegistry = {
  'current-rent-and-other-costs': currentRentAndOtherCosts,
  'rent-frequency': rentFrequency,
  'proposed-market-rent': proposedMarketRent,
} satisfies Record<string, StepDefinition>;
