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
  firstName?: string;
  lastName?: string;
  applicationType?: string;
  tenancyType?: string;
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

export interface ApplicationData {
  caseReference: bigint;
  applicantFirstName: string;
  applicantLastName: string;
  email: string;
  postcode: string;
  applicantIdamUserId: UUID;
  applicationType: string;
}
