import { Request } from 'express';

import { PTCaseData } from '@services/ccdCase.interface';

const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toIsoDate = (day?: unknown, month?: unknown, year?: unknown): string | undefined => {
  if (!day || !month || !year) {
    return undefined;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export function prepareDataForSave(
  sectionId: string,
  req: Request,
  ccdCase: PTCaseData | undefined
): Record<string, unknown> {
  const allFormData = req.session.formData
    ? Object.values(req.session.formData).reduce((acc, stepData) => ({ ...acc, ...stepData }), {})
    : {};

  switch (sectionId) {
    case 'contactPreferences': {
      const contactByText = allFormData?.textUpdates ?? ccdCase?.applicantContactPreferences?.contactByText;
      const isContactByText = contactByText === 'Yes';
      return {
        applicantContactPreferences: {
          textUpdates: contactByText,
          textUpdatesPhoneNumber: isContactByText
            ? (allFormData?.['textUpdates.textUpdatesPhoneNumber'] ??
              ccdCase?.applicantContactPreferences?.mobilePhoneNumber)
            : undefined,
          phoneNumberForCalls: allFormData?.phoneNumberForCalls ?? ccdCase?.applicantContactPreferences?.phoneNumber,
        },
      };
    }
    // case 'whoIsOnTheTenancy': {
    //   return {};
    // }
    // case 'landlordDetails': {
    //   return {};
    // }
    // case 'landlordsNotice': {
    //   return {};
    // }
    // case 'yourTenancyAgreement': {
    //   return {};
    // }

    case 'theCurrentRentAndOtherCosts': {
      const rentDetails = ccdCase?.currentRentsDetails;

      const tribunalDetermined =
        allFormData?.tribunalPreviouslyDeterminedTenancyRent ?? rentDetails?.tribunalPreviouslyDeterminedTenancyRent;
      const includesCouncilTax = allFormData?.rentIncludesCouncilTax ?? rentDetails?.rentIncludesCouncilTax;
      const inclusiveOfUtilities =
        allFormData?.rentInclusiveOfUtilityCharges ?? rentDetails?.rentInclusiveOfUtilityCharges;
      const replacesOriginal =
        allFormData?.currentTenancyReplaceOriginalTenancy ?? rentDetails?.currentTenancyReplaceOriginalTenancy;
      const otherCharges =
        allFormData?.anyOtherHouseholdManagementCharges ?? rentDetails?.anyOtherHouseholdManagementCharges;
      const chargesVary =
        allFormData?.additionalRentalServiceChargesVary ?? rentDetails?.additionalRentalServiceChargesVary;

      return {
        currentRentDetails: {
          tribunalPreviouslyDeterminedTenancyRent: tribunalDetermined,
          previousTribunalCaseReference:
            tribunalDetermined === 'Yes'
              ? (allFormData?.['tribunalPreviouslyDeterminedTenancyRent.previousTribunalCaseReference'] ??
                rentDetails?.previousTribunalCaseReference)
              : undefined,

          rentPaymentFrequency: allFormData?.rentPaymentFrequency ?? rentDetails?.rentPaymentFrequency,
          rentCostWeekly: toNumber(allFormData?.['rentPaymentFrequency.rentCostWeekly'] ?? rentDetails?.rentCostWeekly),
          rentCostFortnightly: toNumber(
            allFormData?.['rentPaymentFrequency.rentCostFortnightly'] ?? rentDetails?.rentCostFortnightly
          ),
          rentCostMonthly: toNumber(
            allFormData?.['rentPaymentFrequency.rentCostMonthly'] ?? rentDetails?.rentCostMonthly
          ),
          rentCostYearly: toNumber(allFormData?.['rentPaymentFrequency.rentCostYearly'] ?? rentDetails?.rentCostYearly),

          rentIncludesCouncilTax: includesCouncilTax,
          councilTaxFrequency:
            includesCouncilTax === 'Yes'
              ? (allFormData?.councilTaxFrequency ?? rentDetails?.councilTaxFrequency)
              : undefined,
          councilTaxCostWeekly:
            includesCouncilTax === 'Yes'
              ? toNumber(allFormData?.['councilTaxFrequency.councilTaxCostWeekly'] ?? rentDetails?.councilTaxCostWeekly)
              : undefined,
          councilTaxCostFortnightly:
            includesCouncilTax === 'Yes'
              ? toNumber(
                  allFormData?.['councilTaxFrequency.councilTaxCostFortnightly'] ??
                    rentDetails?.councilTaxCostFortnightly
                )
              : undefined,
          councilTaxCostMonthly:
            includesCouncilTax === 'Yes'
              ? toNumber(
                  allFormData?.['councilTaxFrequency.councilTaxCostMonthly'] ?? rentDetails?.councilTaxCostMonthly
                )
              : undefined,
          councilTaxCostYearly:
            includesCouncilTax === 'Yes'
              ? toNumber(allFormData?.['councilTaxFrequency.councilTaxCostYearly'] ?? rentDetails?.councilTaxCostYearly)
              : undefined,
          councilTaxFrequencyAndCostDetails:
            includesCouncilTax === 'Yes'
              ? (allFormData?.['councilTaxFrequency.councilTaxFrequencyAndCostDetails'] ??
                rentDetails?.councilTaxFrequencyAndCostDetails)
              : undefined,

          rentInclusiveOfUtilityCharges: inclusiveOfUtilities,
          utilitiesPaidFrequency:
            inclusiveOfUtilities === 'Yes'
              ? (allFormData?.utilitiesPaidFrequency ?? rentDetails?.utilitiesPaidFrequency)
              : undefined,
          utilitiesPaidCostWeekly:
            inclusiveOfUtilities === 'Yes'
              ? toNumber(
                  allFormData?.['utilitiesPaidFrequency.utilitiesPaidCostWeekly'] ?? rentDetails?.utilitiesCostWeekly
                )
              : undefined,
          utilitiesPaidCostFortnightly:
            inclusiveOfUtilities === 'Yes'
              ? toNumber(
                  allFormData?.['utilitiesPaidFrequency.utilitiesPaidCostFortnightly'] ??
                    rentDetails?.utilitiesCostFortnightly
                )
              : undefined,
          utilitiesPaidCostMonthly:
            inclusiveOfUtilities === 'Yes'
              ? toNumber(
                  allFormData?.['utilitiesPaidFrequency.utilitiesPaidCostMonthly'] ?? rentDetails?.utilitiesCostMonthly
                )
              : undefined,
          utilitiesPaidCostYearly:
            inclusiveOfUtilities === 'Yes'
              ? toNumber(
                  allFormData?.['utilitiesPaidFrequency.utilitiesPaidCostYearly'] ?? rentDetails?.utilitiesCostYearly
                )
              : undefined,
          utilitiesPaidFrequencyAndCostDetails:
            inclusiveOfUtilities === 'Yes'
              ? (allFormData?.['utilitiesPaidFrequency.utilitiesPaidFrequencyAndCostDetails'] ??
                rentDetails?.utilitiesPaidFrequencyAndCostDetails)
              : undefined,

          currentTenancyStartDate:
            toIsoDate(
              allFormData?.currentTenancyStartDate?.day,
              allFormData?.currentTenancyStartDate?.month,
              allFormData?.currentTenancyStartDate?.year
            ) ?? rentDetails?.currentTenancyStartDate?.split('T')[0],
          currentTenancyEndDate:
            toIsoDate(
              allFormData?.currentTenancyEndDate?.day,
              allFormData?.currentTenancyEndDate?.month,
              allFormData?.currentTenancyEndDate?.year
            ) ?? rentDetails?.currentTenancyEndDate?.split('T')[0],
          currentTenancyReplaceOriginalTenancy: replacesOriginal,
          originalTenancyStartDate:
            replacesOriginal === 'Yes'
              ? (toIsoDate(
                  allFormData?.['currentTenancyReplaceOriginalTenancy.originalTenancyStartDate-day'],
                  allFormData?.['currentTenancyReplaceOriginalTenancy.originalTenancyStartDate-month'],
                  allFormData?.['currentTenancyReplaceOriginalTenancy.originalTenancyStartDate-year']
                ) ?? rentDetails?.originalTenancyStartDate?.split('T')[0])
              : undefined,

          anyOtherHouseholdManagementCharges: otherCharges,
          otherHouseholdManagementChargesDetails:
            otherCharges === 'Yes'
              ? (allFormData?.otherHouseholdManagementChargesDetails ??
                rentDetails?.otherHouseholdManagementChargesDetails)
              : undefined,
          additionalRentalServiceChargesVary: otherCharges === 'Yes' ? chargesVary : undefined,
          varyingAdditionalRentalServiceChargesDetails:
            otherCharges === 'Yes' && chargesVary === 'Yes'
              ? (allFormData?.['additionalRentalServiceChargesVary.varyingAdditionalRentalServiceChargesDetails'] ??
                rentDetails?.varyingAdditionalRentalServiceChargesDetails)
              : undefined,
        },
      };
    }

    // case 'whatYouThinkMarketRentShouldBe': {
    //   return {};
    // }
    // case 'propertyDetails': {
    //   return {};
    // }
    // case 'propertyInspection': {
    //   return {};
    // }
    // case 'extraSupport': {
    //   return {};
    // }
    // case 'tellUsIfYouNeedHelp': {
    //   return {};
    // }
    // case 'checkYourAnswersAndSubmit': {
    //   return {};
    // }
    default:
      return {};
  }
}
