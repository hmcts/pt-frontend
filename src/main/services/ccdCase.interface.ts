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

export interface CcdCollectionItem<T> {
  id?: string;
  value: T;
}

export type CaseData = CcdCaseData;

/** Case data payload from CCD (START callback case_data or CcdCase.data). */
export interface CcdCaseData {
  //TODO: build this out once data model added to pt-api
  applicantFirstName?: string;
  applicantLastName?: string;
  applicationType?: string;
  tenancyType?: string;

  applicantContactPreferencesTextUpdates?: string | boolean;
  applicantContactPreferencesTextUpdatesPhoneNumber?: string;
  applicantContactPreferencesPhoneNumberForCalls?: string;
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

/** Case data payload returned from PT API get case(s) calls */
export interface PTCaseData extends LandlordDetails, PropertyDetails, LettingAgentDetails, RentDetails, ApplicationDocuments {
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
