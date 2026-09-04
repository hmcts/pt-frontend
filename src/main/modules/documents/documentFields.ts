export type DocumentSlice = 'propertyDetails' | 'noticeOfRentIncreaseDetails';

export interface DocumentFieldDefinition {
  slice: DocumentSlice;
  ptApiField: string;
  ccdField: string;
  documentType: string;
  multiple?: boolean;
}

export const DOCUMENT_FIELDS = {
  floorPlanDocument: {
    slice: 'propertyDetails',
    ptApiField: 'floorPlanDocument',
    ccdField: 'propertyDetailsFloorPlanDocument',
    documentType: 'floorPlan',
  },
  outsidePropertyDocument: {
    slice: 'propertyDetails',
    ptApiField: 'outsidePropertyDocument',
    ccdField: 'propertyDetailsOutsidePropertyDocument',
    documentType: 'outsideProperty',
  },
  repairsEvidenceDocument: {
    slice: 'propertyDetails',
    ptApiField: 'repairsEvidenceDocument',
    ccdField: 'propertyDetailsRepairsEvidenceDocument',
    documentType: 'repairsEvidence',
  },
  roomsDocuments: {
    slice: 'propertyDetails',
    ptApiField: 'propertyRoomsDocuments',
    ccdField: 'propertyDetailsRoomsDocuments',
    documentType: 'propertyRooms',
    multiple: true,
  },
  landlordNoticeProposingNewRentDocument: {
    slice: 'noticeOfRentIncreaseDetails',
    ptApiField: 'landlordNoticeProposingNewRentDocument',
    ccdField: 'noticeOfRentIncreaseDetailsLandlordNoticeProposingNewRentDocument',
    documentType: 'newRentIncreaseNotice',
  },
  noticeNotLegallyValidDocument: {
    slice: 'noticeOfRentIncreaseDetails',
    ptApiField: 'noticeNotLegallyValidDocument',
    ccdField: 'noticeOfRentIncreaseDetailsNoticeNotLegallyValidDocument',
    documentType: 'noticeNotLegallyValidEvidence',
  },
  rentIncreaseToCauseHardshipDocument: {
    slice: 'noticeOfRentIncreaseDetails',
    ptApiField: 'rentIncreaseToCauseHardshipDocument',
    ccdField: 'noticeOfRentIncreaseDetailsRentIncreaseToCauseHardshipDocument',
    documentType: 'hardshipEvidence',
  },
} satisfies Record<string, DocumentFieldDefinition>;

export type DocumentFieldKey = keyof typeof DOCUMENT_FIELDS;

// Lookups keyed on a URL parameter or a persisted value cannot be narrowed to a known key,
// so they widen here and the caller handles an unknown field.
export const documentFieldFor = (key: string): DocumentFieldDefinition | undefined =>
  (DOCUMENT_FIELDS as Record<string, DocumentFieldDefinition>)[key];
