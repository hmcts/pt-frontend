import {
  type UploadLimits,
  acceptAttributeFor,
  extensionOf,
  maxFileSizeBytes,
  maxFileSizeMB,
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
  extraExtensions?: Readonly<Record<string, number>>; // additional file types such as .mp3 and .mp4 outside of default, each mapped to its max size in MB
}

export const DOCUMENT_FIELDS = {
  floorPlanDocuments: {
    slice: 'propertyDetails',
    ptApiField: 'floorPlanDocuments',
    ccdField: 'floorPlanDocuments',
    documentType: 'propertyFloorPlan',
    multiple: true,
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
    extraExtensions: { '.mp3': 100, '.mp4': 100 },
  },
  propertyRoomsDocuments: {
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

const extraExtensionsOf = (field?: DocumentFieldDefinition): string[] => Object.keys(field?.extraExtensions ?? {});

export const acceptFor = (key: string): string => acceptAttributeFor(extraExtensionsOf(documentFieldFor(key)));

export const maxFileSizeMBForFile = (field: DocumentFieldDefinition, filename: string): number =>
  field.extraExtensions?.[extensionOf(filename)] ?? maxFileSizeMB(field.maxFileSizeMB);

export const largestFileSizeMB = (field: DocumentFieldDefinition): number =>
  Math.max(maxFileSizeMB(field.maxFileSizeMB), ...Object.values(field.extraExtensions ?? {}));

export const uploadLimitsFor = (field: DocumentFieldDefinition, filename: string): UploadLimits => ({
  maxBytes: maxFileSizeBytes(maxFileSizeMBForFile(field, filename)),
  maxTotalBytes: maxTotalFileSizeBytes(),
  extraExtensions: extraExtensionsOf(field),
});
