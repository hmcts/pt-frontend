import {
  type UploadLimits,
  acceptAttributeFor,
  maxFileSizeBytes,
  maxTotalFileSizeBytes,
} from '@utils/documentUploadValidation';

export type DocumentSlice = 'propertyDetails' | 'noticeOfRentIncreaseDetails' | 'tenancyAgreementDetails';

export interface DocumentFieldDefinition {
  slice: DocumentSlice;
  ptApiField: string;
  ccdField: string;
  documentType: string;
  multiple?: boolean;
  maxFileSizeMB?: number; // falls back to the maxFileSizeMB config value if not set
  extraExtensions?: readonly string[]; // used to allow additional file types such as .mp3 and .mp4 outside of default
}

export const DOCUMENT_FIELDS = {
  floorPlanDocument: {
    slice: 'propertyDetails',
    ptApiField: 'floorPlanDocument',
    ccdField: 'floorPlanDocument',
    documentType: 'propertyFloorPlan',
  },
  outsidePropertyDocument: {
    slice: 'propertyDetails',
    ptApiField: 'outsidePropertyDocument',
    ccdField: 'outsidePropertyDocument',
    documentType: 'outsideProperty',
  },
  repairsEvidenceDocument: {
    slice: 'propertyDetails',
    ptApiField: 'repairsEvidenceDocument',
    ccdField: 'repairsEvidenceDocument',
    documentType: 'tenantRepairsEvidence',
    maxFileSizeMB: 100,
    extraExtensions: ['.mp3', '.mp4'],
  },
  roomsDocuments: {
    slice: 'propertyDetails',
    ptApiField: 'propertyRoomsDocuments',
    ccdField: 'roomsDocuments',
    documentType: 'propertyRooms',
    multiple: true,
  },
  landlordNoticeProposingNewRentDocument: {
    slice: 'noticeOfRentIncreaseDetails',
    ptApiField: 'landlordNoticeProposingNewRentDocument',
    ccdField: 'landlordNoticeProposingNewRentDocument',
    documentType: 'newRentIncreaseNotice',
  },
  noticeNotLegallyValidDocument: {
    slice: 'noticeOfRentIncreaseDetails',
    ptApiField: 'noticeNotLegallyValidDocument',
    ccdField: 'noticeNotLegallyValidDocument',
    documentType: 'noticeNotLegallyValidEvidence',
  },
  rentIncreaseToCauseHardshipDocument: {
    slice: 'noticeOfRentIncreaseDetails',
    ptApiField: 'rentIncreaseToCauseHardshipDocument',
    ccdField: 'rentIncreaseToCauseHardshipDocument',
    documentType: 'hardshipEvidence',
  },
  tenancyAgreementDocument: {
    slice: 'tenancyAgreementDetails',
    ptApiField: 'tenancyAgreementDocument',
    ccdField: 'tenancyAgreementDocument',
    documentType: 'tenancyAgreement',
  },
} satisfies Record<string, DocumentFieldDefinition>;

export type DocumentFieldKey = keyof typeof DOCUMENT_FIELDS;

// Lookups keyed on a URL parameter or a persisted value cannot be narrowed to a known key,
// so they widen here and the caller handles an unknown field.
export const documentFieldFor = (key: string): DocumentFieldDefinition | undefined =>
  (DOCUMENT_FIELDS as Record<string, DocumentFieldDefinition>)[key];

export const maxFileSizeMBFor = (key: string): number | undefined => documentFieldFor(key)?.maxFileSizeMB;

export const acceptFor = (key: string): string => acceptAttributeFor(documentFieldFor(key)?.extraExtensions);

export const uploadLimitsFor = (field: DocumentFieldDefinition): UploadLimits => ({
  maxBytes: maxFileSizeBytes(field.maxFileSizeMB),
  maxTotalBytes: maxTotalFileSizeBytes(),
  extraExtensions: field.extraExtensions,
});
