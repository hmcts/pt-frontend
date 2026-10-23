import { Request } from 'express';

import { getFormData, getFormDataString } from '@modules/steps/formBuilder/helpers';
import { PTCaseData } from '@services/ccdCase.interface';
import { toCaseReference16 } from '@utils/caseReference';

type DateParts = { day?: string; month?: string; year?: string };

/** Saved answers are only safe to fall back on when they belong to the case being written. */
function caseForThisRequest(req: Request, ccdCase: PTCaseData | undefined): PTCaseData | undefined {
  const routeCaseReference = toCaseReference16(req.params?.caseReference);
  if (!routeCaseReference || ccdCase?.caseReference === undefined) {
    return undefined;
  }
  return String(ccdCase.caseReference) === routeCaseReference ? ccdCase : undefined;
}

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

const dateParts = (req: Request, step: string, field: string): DateParts | undefined =>
  getFormData(req, step)[field] as DateParts | undefined;

export function prepareDataForSave(
  sectionId: string,
  req: Request,
  ccdCase: PTCaseData | undefined
): Record<string, unknown> {
  const saved = caseForThisRequest(req, ccdCase);

  switch (sectionId) {
    case 'contactPreferences': {
      const contactByText =
        getFormDataString(req, 'text-updates', 'textUpdates') ?? saved?.applicantContactPreferences?.contactByText;
      const isContactByText = contactByText === 'Yes';
      return {
        applicantContactPreferences: {
          textUpdates: contactByText,
          textUpdatesPhoneNumber: isContactByText
            ? (getFormDataString(req, 'text-updates', 'textUpdates.textUpdatesPhoneNumber') ??
              saved?.applicantContactPreferences?.mobilePhoneNumber)
            : undefined,
          phoneNumberForCalls:
            getFormDataString(req, 'contact-by-phone', 'phoneNumberForCalls') ??
            saved?.applicantContactPreferences?.phoneNumber,
        },
      };
    }
    case 'whoIsOnTheTenancy': {
      return {
        applicantFirstName:
          getFormDataString(req, 'your-information', 'applicantFirstName') ?? saved?.applicantFirstName,
        applicantLastName: getFormDataString(req, 'your-information', 'applicantLastName') ?? saved?.applicantLastName,
        tenantDetails: {
          companyName: getFormDataString(req, 'your-information', 'companyName') ?? saved?.tenantDetails?.companyName,
          referenceNumberForCommunications:
            getFormDataString(req, 'your-information', 'referenceNumberForCommunications') ??
            saved?.tenantDetails?.referenceNumberForCommunications,
        },
      };
    }
    // case 'landlordDetails': {
    //   return {};
    // }
    // case 'landlordsNotice': {
    //   return {};
    // }
    case 'yourTenancyAgreement': {
      const copyOfTenancyAgreement =
        getFormDataString(req, 'have-tenancy-agreement', 'copyOfTenancyAgreement') ??
        saved?.tenancyAgreementDetails?.copyOfTenancyAgreement;
      const isYes = copyOfTenancyAgreement === 'Yes';
      return {
        tenancyAgreementDetails: {
          copyOfTenancyAgreement,
          noTenancyAgreementReason: isYes
            ? undefined
            : (getFormDataString(req, 'have-tenancy-agreement', 'copyOfTenancyAgreement.noTenancyAgreementReason') ??
              saved?.tenancyAgreementDetails?.noTenancyAgreementReason),
        },
      };
    }

    case 'theCurrentRentAndOtherCosts': {
      const rentDetails = saved?.currentRentsDetails;

      const startDate = dateParts(req, 'current-tenancy-start-date', 'currentTenancyStartDate');
      const endDate = dateParts(req, 'tenancy-end-date', 'currentTenancyEndDate');

      const tribunalDetermined =
        getFormDataString(req, 'tribunal-previously-determined-rent', 'tribunalPreviouslyDeterminedTenancyRent') ??
        rentDetails?.tribunalPreviouslyDeterminedTenancyRent;
      const includesCouncilTax =
        getFormDataString(req, 'rent-includes-council-tax', 'rentIncludesCouncilTax') ??
        rentDetails?.rentIncludesCouncilTax;
      const inclusiveOfUtilities =
        getFormDataString(req, 'rent-inclusive-of-utility-charges', 'rentInclusiveOfUtilityCharges') ??
        rentDetails?.rentInclusiveOfUtilityCharges;
      const replacesOriginal =
        getFormDataString(req, 'current-tenancy-replace-original-tenancy', 'currentTenancyReplaceOriginalTenancy') ??
        rentDetails?.currentTenancyReplaceOriginalTenancy;
      const otherCharges =
        getFormDataString(req, 'other-household-management-charges', 'anyOtherHouseholdManagementCharges') ??
        rentDetails?.anyOtherHouseholdManagementCharges;
      const chargesVary =
        getFormDataString(req, 'additional-rental-service-charges-vary', 'additionalRentalServiceChargesVary') ??
        rentDetails?.additionalRentalServiceChargesVary;

      return {
        currentRentDetails: {
          tribunalPreviouslyDeterminedTenancyRent: tribunalDetermined,
          previousTribunalCaseReference:
            tribunalDetermined === 'Yes'
              ? (getFormDataString(
                  req,
                  'tribunal-previously-determined-rent',
                  'tribunalPreviouslyDeterminedTenancyRent.previousTribunalCaseReference'
                ) ?? rentDetails?.previousTribunalCaseReference)
              : undefined,

          rentPaymentFrequency:
            getFormDataString(req, 'rent-payment-frequency', 'rentPaymentFrequency') ??
            rentDetails?.rentPaymentFrequency,
          rentCostWeekly: toNumber(
            getFormDataString(req, 'rent-payment-frequency', 'rentPaymentFrequency.rentCostWeekly') ??
              rentDetails?.rentCostWeekly
          ),
          rentCostFortnightly: toNumber(
            getFormDataString(req, 'rent-payment-frequency', 'rentPaymentFrequency.rentCostFortnightly') ??
              rentDetails?.rentCostFortnightly
          ),
          rentCostMonthly: toNumber(
            getFormDataString(req, 'rent-payment-frequency', 'rentPaymentFrequency.rentCostMonthly') ??
              rentDetails?.rentCostMonthly
          ),
          rentCostYearly: toNumber(
            getFormDataString(req, 'rent-payment-frequency', 'rentPaymentFrequency.rentCostYearly') ??
              rentDetails?.rentCostYearly
          ),

          rentIncludesCouncilTax: includesCouncilTax,
          councilTaxFrequency:
            includesCouncilTax === 'Yes'
              ? (getFormDataString(req, 'council-tax-frequency', 'councilTaxFrequency') ??
                rentDetails?.councilTaxFrequency)
              : undefined,
          councilTaxCostWeekly:
            includesCouncilTax === 'Yes'
              ? toNumber(
                  getFormDataString(req, 'council-tax-frequency', 'councilTaxFrequency.councilTaxCostWeekly') ??
                    rentDetails?.councilTaxCostWeekly
                )
              : undefined,
          councilTaxCostFortnightly:
            includesCouncilTax === 'Yes'
              ? toNumber(
                  getFormDataString(req, 'council-tax-frequency', 'councilTaxFrequency.councilTaxCostFortnightly') ??
                    rentDetails?.councilTaxCostFortnightly
                )
              : undefined,
          councilTaxCostMonthly:
            includesCouncilTax === 'Yes'
              ? toNumber(
                  getFormDataString(req, 'council-tax-frequency', 'councilTaxFrequency.councilTaxCostMonthly') ??
                    rentDetails?.councilTaxCostMonthly
                )
              : undefined,
          councilTaxCostYearly:
            includesCouncilTax === 'Yes'
              ? toNumber(
                  getFormDataString(req, 'council-tax-frequency', 'councilTaxFrequency.councilTaxCostYearly') ??
                    rentDetails?.councilTaxCostYearly
                )
              : undefined,
          councilTaxFrequencyAndCostDetails:
            includesCouncilTax === 'Yes'
              ? (getFormDataString(
                  req,
                  'council-tax-frequency',
                  'councilTaxFrequency.councilTaxFrequencyAndCostDetails'
                ) ?? rentDetails?.councilTaxFrequencyAndCostDetails)
              : undefined,

          rentInclusiveOfUtilityCharges: inclusiveOfUtilities,
          utilitiesPaidFrequency:
            inclusiveOfUtilities === 'Yes'
              ? (getFormDataString(req, 'utilities-paid-frequency', 'utilitiesPaidFrequency') ??
                rentDetails?.utilitiesPaidFrequency)
              : undefined,
          utilitiesPaidCostWeekly:
            inclusiveOfUtilities === 'Yes'
              ? toNumber(
                  getFormDataString(
                    req,
                    'utilities-paid-frequency',
                    'utilitiesPaidFrequency.utilitiesPaidCostWeekly'
                  ) ?? rentDetails?.utilitiesCostWeekly
                )
              : undefined,
          utilitiesPaidCostFortnightly:
            inclusiveOfUtilities === 'Yes'
              ? toNumber(
                  getFormDataString(
                    req,
                    'utilities-paid-frequency',
                    'utilitiesPaidFrequency.utilitiesPaidCostFortnightly'
                  ) ?? rentDetails?.utilitiesCostFortnightly
                )
              : undefined,
          utilitiesPaidCostMonthly:
            inclusiveOfUtilities === 'Yes'
              ? toNumber(
                  getFormDataString(
                    req,
                    'utilities-paid-frequency',
                    'utilitiesPaidFrequency.utilitiesPaidCostMonthly'
                  ) ?? rentDetails?.utilitiesCostMonthly
                )
              : undefined,
          utilitiesPaidCostYearly:
            inclusiveOfUtilities === 'Yes'
              ? toNumber(
                  getFormDataString(
                    req,
                    'utilities-paid-frequency',
                    'utilitiesPaidFrequency.utilitiesPaidCostYearly'
                  ) ?? rentDetails?.utilitiesCostYearly
                )
              : undefined,
          utilitiesPaidFrequencyAndCostDetails:
            inclusiveOfUtilities === 'Yes'
              ? (getFormDataString(
                  req,
                  'utilities-paid-frequency',
                  'utilitiesPaidFrequency.utilitiesPaidFrequencyAndCostDetails'
                ) ?? rentDetails?.utilitiesPaidFrequencyAndCostDetails)
              : undefined,

          currentTenancyStartDate:
            toIsoDate(startDate?.day, startDate?.month, startDate?.year) ??
            rentDetails?.currentTenancyStartDate?.split('T')[0],
          currentTenancyEndDate:
            toIsoDate(endDate?.day, endDate?.month, endDate?.year) ?? rentDetails?.currentTenancyEndDate?.split('T')[0],
          currentTenancyReplaceOriginalTenancy: replacesOriginal,
          originalTenancyStartDate:
            replacesOriginal === 'Yes'
              ? (toIsoDate(
                  getFormDataString(
                    req,
                    'current-tenancy-replace-original-tenancy',
                    'currentTenancyReplaceOriginalTenancy.originalTenancyStartDate-day'
                  ),
                  getFormDataString(
                    req,
                    'current-tenancy-replace-original-tenancy',
                    'currentTenancyReplaceOriginalTenancy.originalTenancyStartDate-month'
                  ),
                  getFormDataString(
                    req,
                    'current-tenancy-replace-original-tenancy',
                    'currentTenancyReplaceOriginalTenancy.originalTenancyStartDate-year'
                  )
                ) ?? rentDetails?.originalTenancyStartDate?.split('T')[0])
              : undefined,

          anyOtherHouseholdManagementCharges: otherCharges,
          otherHouseholdManagementChargesDetails:
            otherCharges === 'Yes'
              ? (getFormDataString(
                  req,
                  'other-household-management-charges-details',
                  'otherHouseholdManagementChargesDetails'
                ) ?? rentDetails?.otherHouseholdManagementChargesDetails)
              : undefined,
          additionalRentalServiceChargesVary: otherCharges === 'Yes' ? chargesVary : undefined,
          varyingAdditionalRentalServiceChargesDetails:
            otherCharges === 'Yes' && chargesVary === 'Yes'
              ? (getFormDataString(
                  req,
                  'additional-rental-service-charges-vary',
                  'additionalRentalServiceChargesVary.varyingAdditionalRentalServiceChargesDetails'
                ) ?? rentDetails?.varyingAdditionalRentalServiceChargesDetails)
              : undefined,
        },
      };
    }

    case 'whatYouThinkMarketRentShouldBe': {
      const marketRentDetails = saved?.marketRentDetails;

      return {
        marketRentDetails: {
          applicantSuggestedMarketRent: toNumber(
            getFormDataString(req, 'proposed-market-rent', 'applicantSuggestedMarketRent') ??
              marketRentDetails?.applicantSuggestedMarketRent
          ),
          applicantSuggestedMarketRentReasons:
            getFormDataString(req, 'proposed-market-rent-reasons', 'applicantSuggestedMarketRentReasons') ??
            marketRentDetails?.applicantSuggestedMarketRentReasons,
        },
      };
    }

    case 'propertyDetails': {
      const propertyDetails = saved?.propertyDetails;

      const propertyType =
        getFormDataString(req, 'what-are-you-renting', 'propertyType') ?? propertyDetails?.propertyType;

      const hasFloorPlan =
        getFormDataString(req, 'floor-plan-of-property', 'hasFloorPlanOfProperty') ??
        propertyDetails?.hasFloorPlanOfProperty;

      const otherFacilities =
        getFormDataString(req, 'does-the-tenancy-include-other-facilities', 'propertyIncludesOtherFacilities') ??
        propertyDetails?.propertyIncludesOtherFacilities;

      const sharedWithLandlord =
        getFormDataString(req, 'do-you-share-the-property-with-landlord', 'propertySharedWithLandlord') ??
        propertyDetails?.propertySharedWithLandlord;

      const furnitureProvided =
        getFormDataString(req, 'furniture-provided-tenancy', 'furnitureProvided') ?? propertyDetails?.furnitureProvided;

      const servicesProvided =
        getFormDataString(req, 'services-provided-tenancy', 'servicesProvided') ?? propertyDetails?.servicesProvided;

      const repairsAndImprovements =
        getFormDataString(req, 'repairs-and-improvments', 'hasRepairsAndImprovements') ??
        propertyDetails?.hasRepairsAndImprovements;

      return {
        propertyDetails: {
          addressLine1: getFormDataString(req, '', 'addressLine1') ?? propertyDetails?.addressLine1,
          addressLine2: getFormDataString(req, '', 'addressLine2') ?? propertyDetails?.addressLine2,
          postTown: getFormDataString(req, '', 'townOrCity') ?? propertyDetails?.townOrCity,
          county: getFormDataString(req, '', 'county') ?? propertyDetails?.county,
          postcode: getFormDataString(req, '', 'postcode') ?? propertyDetails?.postcode,

          propertyType,
          rentingRoomDetails:
            propertyType === 'roomOrRooms'
              ? (getFormDataString(req, 'what-are-you-renting', 'propertyType.roomOrRoomsDescription') ??
                propertyDetails?.propertyTypeRoomDescription)
              : undefined,
          rentingFlatDetails:
            propertyType === 'flat'
              ? (getFormDataString(req, 'what-are-you-renting', 'propertyType.flatFloor') ??
                propertyDetails?.propertyTypeFlatFloor)
              : undefined,
          otherMethodRentingDetails:
            propertyType === 'other'
              ? (getFormDataString(req, 'what-are-you-renting', 'propertyType.otherDescription') ??
                propertyDetails?.propertyTypeOtherDescription)
              : undefined,

          propertyFloorPlanAvailable: hasFloorPlan,
          floorPlanManualDetails:
            hasFloorPlan === false || String(hasFloorPlan).toLocaleLowerCase() === 'no'
              ? (getFormDataString(req, 'floor-plan-of-property', 'hasFloorPlanOfProperty.propertyLayoutDescription') ??
                propertyDetails?.propertyLayoutDescription)
              : undefined,

          indoorFeatures:
            getFormDataString(req, 'indoor-features', 'indoorFeatures') ?? propertyDetails?.indoorFeatures,

          otherFacilitiesAvailable: otherFacilities,
          otherFacilitiesDetails:
            otherFacilities === true || String(otherFacilities).toLowerCase() === 'yes'
              ? (getFormDataString(
                  req,
                  'does-the-tenancy-include-other-facilities',
                  'propertyIncludesOtherFacilities.propertyFacilitiesDescription'
                ) ?? propertyDetails?.propertyFacilitiesDescription)
              : undefined,

          sharePropertyWithLandlord: sharedWithLandlord,
          sharePropertyWithLandlordDetails:
            sharedWithLandlord === true || String(sharedWithLandlord).toLowerCase() === 'yes'
              ? (getFormDataString(
                  req,
                  'do-you-share-the-property-with-landlord',
                  'propertySharedWithLandlord.propertySharedWithLandlordDetails'
                ) ?? propertyDetails?.propertySharedWithLandlordDetails)
              : undefined,

          furnitureProvidedInTenancy: furnitureProvided,
          furnitureProvidedInTenancyDetails:
            furnitureProvided === true || String(furnitureProvided).toLowerCase() === 'yes'
              ? (getFormDataString(req, 'furniture-provided-tenancy', 'furnitureProvided.furnitureProvidedDetails') ??
                propertyDetails?.furnitureProvidedDetails)
              : undefined,

          servicesProvidedInTenancy: servicesProvided,
          servicesProvidedInTenancyDetails:
            servicesProvided === true || String(servicesProvided).toLowerCase() === 'yes'
              ? (getFormDataString(req, 'services-provided-tenancy', 'servicesProvided.servicesProvidedDetails') ??
                propertyDetails?.servicesProvidedDetails)
              : undefined,

          landlordRepairsDetails:
            getFormDataString(req, 'what-reairs-landlord-responsibility', 'landlordRepairsDetails') ??
            propertyDetails?.landlordRepairsDetails,

          tenantRepairDetails:
            getFormDataString(req, 'what-reairs-landlord-responsibility', 'tenantRepairDetails') ??
            propertyDetails?.tenantRepairsDetails,

          anyTenantsMadePropertyRepairs: repairsAndImprovements,
        },
      };
    }

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
