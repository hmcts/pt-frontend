import { UUID } from 'node:crypto';

export const CITIZEN_CREATE_CASE = 'citizen-create-application';
export const CITIZEN_UPDATE_CASE = 'citizen-update-application';
export const CITIZEN_SUBMIT_CASE = 'citizen-submit-application';

export type YesNoValue = 'YES' | 'NO' | null;
export type YesNoNotSureValue = 'YES' | 'NO' | 'NOT_SURE' | null;
export enum YesNoEnum {
  YES = 'YES',
  NO = 'NO',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}
export type FrequencyValue = 'WEEKLY' | 'MONTHLY';
export type PaymentFrequency = 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'YEARLY';
export type RentPaymentFrequencyValue = PaymentFrequency | null;
export type CouncilTaxFrequencyValue = PaymentFrequency | 'OTHER' | null;
export type UtilitiesPaidFrequencyValue = PaymentFrequency | 'OTHER' | null;
export type DateValue = { day: string; month: string; year: string };
export type CurrentTenancyStartDateValue = DateValue | null;
export type TenancyEndDateValue = DateValue | null;
export type OriginalTenancyStartDateValue = DateValue | null;
export enum LanguageUsed {
  ENGLISH = 'ENGLISH',
  WELSH = 'WELSH',
  ENGLISH_AND_WELSH = 'ENGLISH_AND_WELSH',
}

/** CCD SDK Document type -- flat reference with URLs. */
export interface CcdDocumentReference {
  document_url: string;
  document_binary_url: string;
  document_filename: string;
  document_hash?: string;
  category_id?: string;
  upload_timestamp?: string;
}

/** Wraps CCD Document with metadata fields (matches backend UploadedDocument). */
export interface CcdUploadedDocument {
  documentType?: string;
  document: CcdDocumentReference;
  contentType?: string;
  sizeInBytes?: number;
}

export interface CcdCollectionItem<T> {
  id?: string;
  value: T;
}

export type CaseData = CcdCaseData;

/**
 * Case data payload from CCD (START callback case_data or CcdCase.data).
 * To reflect PTCase.java in pt-api
 * */
export interface CcdCaseData {
  applicantFirstName?: string;
  applicantLastName?: string;
  applicationType?: string;
  tenancyType?: string;

  applicantContactPreferences?: {
    textUpdates?: string | boolean;
    textUpdatesPhoneNumber?: string;
    phoneNumberForCalls?: string;
  };

  tenantDetails?: {
    companyName?: string;
    referenceNumberForCommunications?: string;
  };

  hearingInspectionDetails?: {
    hearingRequested?: string | boolean;
    agreeToDecisionWithoutInspection?: string | boolean;
    noDecisionWithoutInspectionReason?: string;
  };

  noticeOfRentIncreaseDetails?: {
    receivedLandlordNoticeProposingNewRent?: string | boolean;
    noUploadOfNoticeProposingNewRentReason?: string;
    landlordNoticeProposingNewRentDocument?: CcdUploadedDocument;
    noticeLegallyValid?: string | boolean;
    noticeNotLegallyValidDetails?: string;
    noticeNotLegallyValidDocument?: CcdUploadedDocument;
    rentIncreaseToCauseHardship?: string | boolean;
    rentIncreaseToCauseHardshipDocument?: CcdUploadedDocument;
  };

  propertyDetails?: {
    addressLine1?: string;
    addressLine2?: string;
    postTown?: string;
    county?: string;
    postcode?: string;
    propertyType?: string;
    rentingFlatDetails?: string;
    rentingRoomDetails?: string;
    otherMethodRentingDetails?: string;
    propertyFloorPlanAvailable?: string | boolean;
    floorPlanManualDetails?: string;
    floorPlanDocument?: CcdUploadedDocument;
    indoorFeatures?: string;
    otherFacilitiesAvailable?: string | boolean;
    otherFacilitiesDetails?: string;
    outsidePropertyDocument?: CcdUploadedDocument;
    propertyRoomsDocuments?: CcdCollectionItem<CcdUploadedDocument>[];
    furnitureProvidedInTenancy?: string | boolean;
    furnitureProvidedInTenancyDetails?: string;
    additionalServicesProvidedInTenancy?: string | boolean;
    additionalServicesProvidedInTenancyDetails?: string;
    sharePropertyWithLandlord?: string | boolean;
    sharePropertyWithLandlordDetails?: string;
    landlordRepairsDetails?: string;
    tenantRepairsDetails?: string;
    anyTenantsMadePropertyRepairs?: string;
    repairsEvidenceDocument?: CcdUploadedDocument;
  };

  currentRentDetails?: {
    tribunalPreviouslyDeterminedTenancyRent?: string | boolean;
    previousTribunalCaseReference?: string;
    rentPaymentFrequency?: string;
    rentCostWeekly?: number;
    rentCostFortnightly?: number;
    rentCostMonthly?: number;
    rentCostYearly?: number;
    rentIncludesCouncilTax?: string | boolean;
    councilTaxFrequency?: string;
    councilTaxCostWeekly?: number;
    councilTaxCostFortnightly?: number;
    councilTaxCostMonthly?: number;
    councilTaxCostYearly?: number;
    councilTaxFrequencyAndCostDetails?: string;
    utilitiesPaidFrequency?: string;
    utilitiesPaidCostWeekly?: number;
    utilitiesPaidCostFortnightly?: number;
    utilitiesPaidCostMonthly?: number;
    utilitiesPaidCostYearly?: number;
    utilitiesPaidFrequencyAndCostDetails?: string;
    currentTenancyStartDate?: string;
    currentTenancyEndDate?: string;
    currentTenancyReplaceOriginalTenancy?: string;
    originalTenancyStartDate?: string;
    additionalRentalServiceChargesVary?: string | boolean;
    additionalRentalVaryingServiceChargesDetails?: string;
    anyOtherHouseholdManagementCharges?: string | boolean;
    otherHouseholdManagementChargesDetails?: string;
  };

  marketRentDetails?: {
    applicantSuggestedMonthlyMarketRent?: number;
    applicantSuggestedMonthlyMarketRentReasons?: string;
    suggestedMarketRentEvidence?: CcdUploadedDocument;
    additionalInfoToConsiderWhenDeterminingRent?: string | boolean;
    additionalInfoToConsiderWhenDeterminingRentDetails?: string;
  };

  tenancyAgreementDetails?: {
    copyOfTenancyAgreement?: string | boolean;
    noTenancyAgreementReason?: string;
    tenancyAgreementDocument?: CcdUploadedDocument;
  };

  landlordDetails?: {
    landlordPartyDetails?: PartyDetails;
    representativeType?: string;
    lettingAgentPartyDetails?: PartyDetails;
    representativePartyDetails?: PartyDetails;
  };
}

export interface PartyDetails {
  firstName?: string;
  lastName?: string;
  organisationName?: string;
  addressLine1?: string;
  addressLine2?: string;
  postTown?: string;
  county?: string;
  postcode?: string;
  emailAddress?: string;
  phoneNumber?: string;
  dxNumber?: string;
}

/** Case representation used by services: id + case_data. */
export interface CcdCase {
  id: string;
  data: CcdCaseData;
}

/** Links object in CCD START callback response. */
export interface CcdStartCallbackLinks {
  self: {
    href: string;
  };
}

/** case_details envelope from CCD START callback (metadata + case_data). */
export interface CcdCaseDetails {
  id: number;
  jurisdiction: string;
  state: string;
  version: number;
  case_type_id: string;
  created_date: string;
  last_modified: string;
  last_state_modified_date: string;
  security_classification: string;
  case_data: CcdCaseData;
  data_classification?: Record<string, unknown>;
  supplementary_data?: Record<string, unknown>;
  after_submit_callback_response?: unknown;
  callback_response_status_code?: unknown;
  callback_response_status?: unknown;
  delete_draft_response_status_code?: unknown;
  delete_draft_response_status?: unknown;
}

export interface StartCallbackData {
  token: string;
  _links: CcdStartCallbackLinks;
  case_details: CcdCaseDetails;
  event_id: string;
}

/**
 * Case data payload returned from PT API get case(s) calls
 * To reflect ApplicationDto in pt-api
 * */
export interface PTCaseData
  extends
    LandlordDetails,
    PropertyDetails,
    LettingAgentDetails,
    RentDetails,
    ApplicationDocuments,
    InspectionAndHearing,
    HelpWithFeesDetails {
  caseReference: bigint;
  createdDate: string;
  submittedOn?: string;

  applicantFirstName?: string;
  applicantLastName?: string;
  email?: string;
  postcode?: string;
  applicantIdamUserId?: UUID;
  applicationType?: string;
  tenancyType?: string;

  applicantContactPreferences?: ContactPreferences;
}

export interface ContactPreferences {
  contactByText?: string;
  mobilePhoneNumber?: string;
  phoneNumber?: string;
}

export interface LettingAgentDetails {
  lettingAgentEmailAddress?: string;
  lettingAgentPhoneNumber?: string;
}

export interface LandlordDetails {
  landlordPhoneNumber?: string;
  landlordHasLettingAgentOrRepresentative?: string;
  landlordEmailAddress?: string;
  representativeEmailAddress?: string;
  representativePhoneNumber?: string;
}

export interface ApplicationDocuments {
  hasTenancyAgreement?: string;
  noTenancyAgreementReason?: string;
  noticeLegallyValid?: string;
  noticeNotLegallyValidReason?: string;
}

export interface PropertyDetails {
  addressLine1?: string;
  addressLine2?: string;
  townOrCity?: string;
  county?: string;
  postcode?: string;
  propertyType?: string;
  propertyTypeRoomDescription?: string;
  propertyTypeFlatFloor?: string;
  propertyTypeOtherDescription?: string;
  hasFloorPlanOfProperty?: string | boolean;
  propertyLayoutDescription?: string;
  indoorFeatures?: string;
  propertyIncludesOtherFacilities?: string | boolean;
  propertyFacilitiesDescription?: string;
  propertySharedWithLandlord?: string | boolean;
  propertySharedWithLandlordDetails?: string;
  furnitureProvided?: string | boolean;
  furnitureProvidedDetails?: string;
  servicesProvided?: string | boolean;
  servicesProvidedDetails?: string;
  landlordRepairsResponsibility?: string;
  tenantRepairsResponsibility?: string;
  hasRepairsAndImprovements?: string | boolean;
}

/** Fields captured across the details of rent journey. */
export interface RentDetails {
  // previous tribunal determination
  tribunalPreviouslyDeterminedRent?: YesNoValue;
  previousTribunalCaseReference?: string;

  // rent payment frequency and amount
  rentPaymentFrequency?: RentPaymentFrequencyValue;
  rentCostWeekly?: string;
  rentCostFortnightly?: string;
  rentCostMonthly?: string;
  rentCostYearly?: string;

  // council tax
  rentIncludesCouncilTax?: YesNoValue;
  councilTaxFrequency?: CouncilTaxFrequencyValue;
  councilTaxCostWeekly?: string;
  councilTaxCostFortnightly?: string;
  councilTaxCostMonthly?: string;
  councilTaxCostYearly?: string;
  councilTaxFrequencyAndCostDetails?: string;

  // utilities
  rentInclusiveOfUtilityCharges?: YesNoValue;
  utilitiesPaidFrequency?: UtilitiesPaidFrequencyValue;
  utilitiesCostWeekly?: string;
  utilitiesCostFortnightly?: string;
  utilitiesCostMonthly?: string;
  utilitiesCostYearly?: string;
  utilitiesFrequencyAndCostDetails?: string;

  // tenancy dates
  currentTenancyStartDate?: CurrentTenancyStartDateValue;
  tenancyEndDate?: TenancyEndDateValue;
  currentTenancyReplaceOriginalTenancy?: YesNoNotSureValue;
  originalTenancyStartDate?: OriginalTenancyStartDateValue;

  // other charges
  otherHouseholdManagementCharges?: YesNoValue;
}

export interface InspectionAndHearing {
  agreeToDecisionWithoutInspection?: string | boolean;
  noDecisionWithoutInspectionReason?: string;
  agreeToDecisionWithoutHearing?: string | boolean;
  noDecisionWithoutHearingReason?: string;
}

export interface HelpWithFeesDetails {
  appliedForHelpWithFees?: YesNoValue;
  referenceNumber?: string;
}
