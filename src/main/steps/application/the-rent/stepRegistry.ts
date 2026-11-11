import { step as additionalRentalServiceChargesVary } from './additional-rental-service-charges-vary';
import { step as anythingElseTribunalShouldConsider } from './anything-else-tribunal-should-consider';
import { step as checkYourAnswersTheRent } from './check-your-answers-the-rent';
import { step as councilTaxFrequency } from './council-tax-frequency';
import { step as currentTenancyReplaceOriginalTenancy } from './current-tenancy-replace-original-tenancy';
import { step as currentTenancyStartDate } from './current-tenancy-start-date';
import { step as otherHouseholdManagementCharges } from './other-household-management-charges';
import { step as otherHouseholdManagementChargesDetails } from './other-household-management-charges-details';
import { step as proposedMarketRent } from './proposed-market-rent';
import { step as proposedMarketRentReasons } from './proposed-market-rent-reasons';
import { step as rentIncludesCouncilTax } from './rent-includes-council-tax';
import { step as rentInclusiveOfUtilityCharges } from './rent-inclusive-of-utility-charges';
import { step as rentPaymentFrequency } from './rent-payment-frequency';
import { step as tenancyEndDate } from './tenancy-end-date';
import { step as tribunalPreviouslyDeterminedRent } from './tribunal-previously-determined-rent';
import { step as uploadEvidenceProposedMarketRent } from './upload-evidence-proposed-market-rent';
import { step as utilitiesPaidFrequency } from './utilities-paid-frequency';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const theRentStepRegistry = {
  'tribunal-previously-determined-rent': tribunalPreviouslyDeterminedRent,
  'rent-payment-frequency': rentPaymentFrequency,
  'rent-includes-council-tax': rentIncludesCouncilTax,
  'council-tax-frequency': councilTaxFrequency,
  'rent-inclusive-of-utility-charges': rentInclusiveOfUtilityCharges,
  'utilities-paid-frequency': utilitiesPaidFrequency,
  'current-tenancy-start-date': currentTenancyStartDate,
  'tenancy-end-date': tenancyEndDate,
  'other-household-management-charges': otherHouseholdManagementCharges,
  'current-tenancy-replace-original-tenancy': currentTenancyReplaceOriginalTenancy,
  'other-household-management-charges-details': otherHouseholdManagementChargesDetails,
  'additional-rental-service-charges-vary': additionalRentalServiceChargesVary,
  'proposed-market-rent': proposedMarketRent,
  'proposed-market-rent-reasons': proposedMarketRentReasons,
  'upload-evidence-proposed-market-rent': uploadEvidenceProposedMarketRent,
  'anything-else-tribunal-should-consider': anythingElseTribunalShouldConsider,
  'check-your-answers-the-rent': checkYourAnswersTheRent,
} satisfies Record<string, StepDefinition>;
