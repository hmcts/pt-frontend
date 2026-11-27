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
    case 'landlordDetails': {
      const landlord = saved?.landlordDetails?.landlord;
      const representative = saved?.landlordDetails?.representative;

      const landlordType =
        getFormDataString(req, 'landlord-individual-or-organisation', 'landlordIndividualOrOrganisation') ??
        (landlord?.organisationName ? 'organisation' : 'individual');
      const isOrganisation = landlordType === 'organisation';

      const hasRepresentative =
        getFormDataString(req, 'landlord-has-representative', 'landlordHasRepresentative') ??
        saved?.landlordDetails?.hasRepresentative;
      const representativeIsYes = hasRepresentative === 'Yes';

      return {
        landlordDetails: {
          landlord: {
            firstName: isOrganisation
              ? undefined
              : (getFormDataString(
                  req,
                  'landlord-individual-or-organisation',
                  'landlordIndividualOrOrganisation.landlordFirstName'
                ) ?? landlord?.firstName),
            lastName: isOrganisation
              ? undefined
              : (getFormDataString(
                  req,
                  'landlord-individual-or-organisation',
                  'landlordIndividualOrOrganisation.landlordLastName'
                ) ?? landlord?.lastName),
            organisationName: isOrganisation
              ? (getFormDataString(
                  req,
                  'landlord-individual-or-organisation',
                  'landlordIndividualOrOrganisation.landlordOrganisationName'
                ) ?? landlord?.organisationName)
              : undefined,
            addressLine1: getFormDataString(req, 'landlord-address', 'landlordAddressLine1') ?? landlord?.addressLine1,
            addressLine2: getFormDataString(req, 'landlord-address', 'landlordAddressLine2') ?? landlord?.addressLine2,
            postTown: getFormDataString(req, 'landlord-address', 'landlordPostTown') ?? landlord?.postTown,
            county: getFormDataString(req, 'landlord-address', 'landlordCounty') ?? landlord?.county,
            postcode: getFormDataString(req, 'landlord-address', 'landlordPostcode') ?? landlord?.postcode,
            country: getFormDataString(req, 'landlord-address', 'landlordCountry') ?? landlord?.country,
            emailAddress:
              getFormDataString(req, 'landlord-email-address', 'landlordEmailAddress') ?? landlord?.emailAddress,
            phoneNumber:
              getFormDataString(req, 'landlord-phone-number', 'landlordPhoneNumber') ?? landlord?.phoneNumber,
          },
          hasRepresentative,
          representative: representativeIsYes
            ? {
                firstName:
                  getFormDataString(req, 'landlord-representative-details', 'representativeFirstName') ??
                  representative?.firstName,
                lastName:
                  getFormDataString(req, 'landlord-representative-details', 'representativeLastName') ??
                  representative?.lastName,
                organisationName:
                  getFormDataString(req, 'landlord-representative-details', 'representativeCompanyName') ??
                  representative?.organisationName,
                addressLine1:
                  getFormDataString(req, 'landlord-representative-address', 'representativeAddressLine1') ??
                  representative?.addressLine1,
                addressLine2:
                  getFormDataString(req, 'landlord-representative-address', 'representativeAddressLine2') ??
                  representative?.addressLine2,
                postTown:
                  getFormDataString(req, 'landlord-representative-address', 'representativePostTown') ??
                  representative?.postTown,
                county:
                  getFormDataString(req, 'landlord-representative-address', 'representativeCounty') ??
                  representative?.county,
                postcode:
                  getFormDataString(req, 'landlord-representative-address', 'representativePostcode') ??
                  representative?.postcode,
                emailAddress:
                  getFormDataString(req, 'landlord-representative-email-address', 'representativeEmailAddress') ??
                  representative?.emailAddress,
                phoneNumber:
                  getFormDataString(req, 'landlord-representative-phone-number', 'representativePhoneNumber') ??
                  representative?.phoneNumber,
              }
            : undefined,
        },
      };
    }
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
      return {
        propertyDetails: {
          addressLine1:
            getFormDataString(req, 'property-address', 'addressLine1') ?? saved?.propertyDetails?.addressLine1,
          addressLine2:
            getFormDataString(req, 'property-address', 'addressLine2') ?? saved?.propertyDetails?.addressLine2,
          postTown: getFormDataString(req, 'property-address', 'postTown') ?? saved?.propertyDetails?.postTown,
          county: getFormDataString(req, 'property-address', 'county') ?? saved?.propertyDetails?.county,
          postcode: getFormDataString(req, 'property-address', 'postcode') ?? saved?.propertyDetails?.postcode,
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
