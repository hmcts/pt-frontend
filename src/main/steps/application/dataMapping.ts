import type { Request } from 'express';

import { caseForThisRequest, dateParts, toIsoDate, toNumber } from '../utils/dataMappingHelpers';

import { getFormDataString } from '@modules/steps/formBuilder/helpers';
import type { PTCaseData } from '@services/ccd/ccdCase.interface';

export function prepareApplicationDataForSave(
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
    case 'landlordsNotice': {
      const noticeDetails = saved?.noticeOfRentIncreaseDetails;
      const receivedLandlordNoticeProposingNewRent =
        getFormDataString(req, 'have-landlords-notice', 'receivedLandlordNoticeProposingNewRent') ??
        noticeDetails?.receivedLandlordNoticeProposingNewRent;
      const hasNotice = receivedLandlordNoticeProposingNewRent === 'Yes';
      const noticeLegallyValid =
        getFormDataString(req, 'your-notice-proposing-a-new-rent', 'noticeLegallyValid') ??
        noticeDetails?.noticeLegallyValid;
      const rentIncreaseToCauseHardship =
        getFormDataString(req, 'hardship', 'rentIncreaseToCauseHardship') ?? noticeDetails?.rentIncreaseToCauseHardship;
      const causesHardship = rentIncreaseToCauseHardship === 'Yes';

      return {
        noticeOfRentIncreaseDetails: {
          receivedLandlordNoticeProposingNewRent,
          noUploadOfNoticeProposingNewRentReason: hasNotice
            ? undefined
            : (getFormDataString(
                req,
                'have-landlords-notice',
                'receivedLandlordNoticeProposingNewRent.noUploadOfNoticeProposingNewRentReason'
              ) ?? noticeDetails?.noUploadOfNoticeProposingNewRentReason),
          noticeLegallyValid,
          noticeNotLegallyValidDetails:
            noticeLegallyValid === 'No'
              ? (getFormDataString(
                  req,
                  'your-notice-proposing-a-new-rent',
                  'noticeLegallyValid.noticeNotLegallyValidDetails'
                ) ?? noticeDetails?.noticeNotLegallyValidDetails)
              : undefined,
          rentIncreaseToCauseHardship,
          rentIncreaseToCauseHardshipDetails: causesHardship
            ? (getFormDataString(req, 'hardship', 'rentIncreaseToCauseHardship.rentIncreaseToCauseHardshipDetails') ??
              noticeDetails?.rentIncreaseToCauseHardshipDetails)
            : undefined,
        },
      };
    }
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

    case 'rentDetails': {
      const rentDetails = saved?.rentDetails;

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
      const marketRentFrequency =
        getFormDataString(req, 'proposed-market-rent', 'applicantSuggestedMarketRentFrequency') ??
        rentDetails?.applicantSuggestedMarketRentFrequency;
      const additionalInfo =
        getFormDataString(
          req,
          'anything-else-tribunal-should-consider',
          'additionalInfoToConsiderWhenDeterminingRent'
        ) ?? rentDetails?.additionalPropertyInfoToConsiderWhenDetermining;

      return {
        rentDetails: {
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
          applicantSuggestedMarketRent: toNumber(
            getFormDataString(req, 'proposed-market-rent', 'applicantSuggestedMarketRent') ??
              rentDetails?.applicantSuggestedMarketRent
          ),
          applicantSuggestedMarketRentFrequency: marketRentFrequency,
          applicantSuggestedMarketRentFrequencyOther:
            marketRentFrequency === 'other'
              ? (getFormDataString(
                  req,
                  'proposed-market-rent',
                  'applicantSuggestedMarketRentFrequency.applicantSuggestedMarketRentFrequencyOther'
                ) ?? rentDetails?.applicantSuggestedMarketRentFrequencyOther)
              : undefined,
          applicantSuggestedMarketRentReasons:
            getFormDataString(req, 'proposed-market-rent-reasons', 'applicantSuggestedMarketRentReasons') ??
            rentDetails?.applicantSuggestedMarketRentReasons,
          additionalInfoToConsiderWhenDeterminingRent: additionalInfo,
          additionalInfoToConsiderWhenDeterminingRentDetails:
            additionalInfo === 'Yes'
              ? (getFormDataString(
                  req,
                  'anything-else-tribunal-should-consider',
                  'additionalInfoToConsiderWhenDeterminingRent.additionalInfoToConsiderWhenDeterminingRentDetails'
                ) ?? rentDetails?.additionalPropertyInfoToConsiderWhenDeterminingDetails)
              : undefined,
        },
      };
    }

    case 'propertyDetails': {
      const propertyDetails = saved?.propertyDetails;

      const propertyType =
        getFormDataString(req, 'what-are-you-renting', 'propertyType') ?? propertyDetails?.propertyType;

      const propertyFloorPlanAvailable =
        getFormDataString(req, 'floor-plan-of-property', 'propertyFloorPlanAvailable') ??
        propertyDetails?.propertyFloorPlanAvailable;

      const otherFacilities =
        getFormDataString(req, 'does-the-tenancy-include-other-facilities', 'otherFacilitiesAvailable') ??
        propertyDetails?.otherFacilitiesAvailable;

      const sharedWithLandlord =
        getFormDataString(req, 'do-you-share-the-property-with-landlord', 'sharePropertyWithLandlord') ??
        propertyDetails?.sharePropertyWithLandlord;

      const furnitureProvidedInTenancy =
        getFormDataString(req, 'furniture-provided-tenancy', 'furnitureProvidedInTenancy') ??
        propertyDetails?.furnitureProvidedInTenancy;

      const additionalServicesProvidedInTenancy =
        getFormDataString(req, 'services-provided-tenancy', 'additionalServicesProvidedInTenancy') ??
        propertyDetails?.additionalServicesProvidedInTenancy;

      const anyTenantsMadePropertyRepairs =
        getFormDataString(req, 'repairs-and-improvements', 'anyTenantsMadePropertyRepairs') ??
        propertyDetails?.anyTenantsMadePropertyRepairs;

      return {
        propertyDetails: {
          addressLine1: getFormDataString(req, 'property-address', 'addressLine1') ?? propertyDetails?.addressLine1,
          addressLine2: getFormDataString(req, 'property-address', 'addressLine2') ?? propertyDetails?.addressLine2,
          postTown: getFormDataString(req, 'property-address', 'postTown') ?? propertyDetails?.postTown,
          county: getFormDataString(req, 'property-address', 'county') ?? propertyDetails?.county,
          postcode: getFormDataString(req, 'property-address', 'postcode') ?? propertyDetails?.postcode,

          propertyType,
          rentingRoomDetails:
            propertyType === 'room'
              ? (getFormDataString(req, 'what-are-you-renting', 'propertyType.roomDescription') ??
                propertyDetails?.rentingRoomDetails)
              : undefined,
          rentingFlatDetails:
            propertyType === 'flat'
              ? (getFormDataString(req, 'what-are-you-renting', 'propertyType.flatFloor') ??
                propertyDetails?.rentingFlatDetails)
              : undefined,
          otherMethodRentingDetails:
            propertyType === 'other'
              ? (getFormDataString(req, 'what-are-you-renting', 'propertyType.otherDescription') ??
                propertyDetails?.otherMethodRentingDetails)
              : undefined,

          propertyFloorPlanAvailable,
          floorPlanManualDetails:
            propertyFloorPlanAvailable === false || String(propertyFloorPlanAvailable).toLocaleLowerCase() === 'no'
              ? (getFormDataString(
                  req,
                  'floor-plan-of-property',
                  'propertyFloorPlanAvailable.floorPlanManualDetails'
                ) ?? propertyDetails?.floorPlanManualDetails)
              : undefined,

          indoorFeatures:
            getFormDataString(req, 'indoor-features', 'indoorFeatures') ?? propertyDetails?.indoorFeatures,

          otherFacilitiesAvailable: otherFacilities,
          otherFacilitiesDetails:
            otherFacilities === true || String(otherFacilities).toLowerCase() === 'yes'
              ? (getFormDataString(
                  req,
                  'does-the-tenancy-include-other-facilities',
                  'otherFacilitiesAvailable.otherFacilitiesDetails'
                ) ?? propertyDetails?.otherFacilitiesDetails)
              : undefined,

          sharePropertyWithLandlord: sharedWithLandlord,
          sharePropertyWithLandlordDetails:
            sharedWithLandlord === true || String(sharedWithLandlord).toLowerCase() === 'yes'
              ? (getFormDataString(
                  req,
                  'do-you-share-the-property-with-landlord',
                  'sharePropertyWithLandlord.sharePropertyWithLandlordDetails'
                ) ?? propertyDetails?.sharePropertyWithLandlordDetails)
              : undefined,

          furnitureProvidedInTenancy,
          furnitureProvidedInTenancyDetails:
            furnitureProvidedInTenancy === true || String(furnitureProvidedInTenancy).toLowerCase() === 'yes'
              ? (getFormDataString(
                  req,
                  'furniture-provided-tenancy',
                  'furnitureProvidedInTenancy.furnitureProvidedInTenancyDetails'
                ) ?? propertyDetails?.furnitureProvidedInTenancyDetails)
              : undefined,

          additionalServicesProvidedInTenancy,
          additionalServicesProvidedInTenancyDetails:
            additionalServicesProvidedInTenancy === true ||
            String(additionalServicesProvidedInTenancy).toLowerCase() === 'yes'
              ? (getFormDataString(
                  req,
                  'services-provided-tenancy',
                  'additionalServicesProvidedInTenancy.additionalServicesProvidedInTenancyDetails'
                ) ?? propertyDetails?.additionalServicesProvidedInTenancyDetails)
              : undefined,

          landlordRepairsDetails:
            getFormDataString(req, 'what-repairs-landlord-responsibility', 'landlordRepairsDetails') ??
            propertyDetails?.landlordRepairsDetails,

          tenantRepairsDetails:
            getFormDataString(req, 'what-repairs-tenant-responsibility', 'tenantRepairsDetails') ??
            propertyDetails?.tenantRepairsDetails,

          anyTenantsMadePropertyRepairs,
          tenantsPropertyRepairsDetails:
            String(anyTenantsMadePropertyRepairs).toLowerCase() === 'yes'
              ? (getFormDataString(
                  req,
                  'repairs-and-improvements',
                  'anyTenantsMadePropertyRepairs.tenantsPropertyRepairsDetails'
                ) ?? propertyDetails?.tenantsPropertyRepairsDetails)
              : undefined,
        },
      };
    }

    case 'propertyInspection': {
      const details = saved?.hearingInspectionDetails;
      const agreeToDecisionWithoutInspection =
        getFormDataString(req, 'property-inspection', 'agreeToDecisionWithoutInspection') ??
        details?.agreeToDecisionWithoutInspection;
      const hearingRequested = getFormDataString(req, 'hearing', 'hearingRequested') ?? details?.hearingRequested;

      return {
        hearingInspectionDetails: {
          agreeToDecisionWithoutInspection,
          noDecisionWithoutInspectionReason:
            agreeToDecisionWithoutInspection === 'No'
              ? (getFormDataString(
                  req,
                  'property-inspection',
                  'agreeToDecisionWithoutInspection.noDecisionWithoutInspectionReason'
                ) ?? details?.noDecisionWithoutInspectionReason)
              : undefined,
          hearingRequested,
          reasonHearingRequested:
            hearingRequested === 'Yes'
              ? (getFormDataString(req, 'hearing', 'hearingRequested.reasonHearingRequested') ??
                details?.reasonHearingRequested)
              : undefined,
        },
      };
    }
    case 'extraSupport': {
      const extraSupportRequired =
        getFormDataString(req, 'extra-support', 'extraSupport') ?? saved?.extraSupportDetails?.extraSupportRequired;

      const supportIsRequired = extraSupportRequired === 'Yes' || extraSupportRequired === 'YES';

      return {
        extraSupportDetails: {
          extraSupportRequired,
          extraSupportRequiredDetails: supportIsRequired
            ? (getFormDataString(req, 'extra-support', 'extraSupport.extraSupportDetails') ??
              saved?.extraSupportDetails?.extraSupportRequiredDetails)
            : undefined,
        },
      };
    }
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
