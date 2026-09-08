import type { Request } from 'express';

import { DOCUMENT_FIELDS, type DocumentFieldDefinition, documentFieldFor } from './documentFields';

import { Logger } from '@modules/logger';
import { getCaseApi } from '@services/ccdApiClient';
import { CITIZEN_DELETE_DOCUMENT, CITIZEN_UPLOAD_DOCUMENT } from '@services/ccdCase.interface';
import type { CdamDocument } from '@services/documentUpload.interface';
import { getPtApi } from '@services/ptApi/ptApiClient';

const logger = Logger.getLogger('documentStorage');

export interface PtApiDocument {
  id?: number;
  url?: string;
  binaryUrl?: string;
  filename?: string;
  contentType?: string;
  size?: number;
}

export interface CcdUploadedDocument {
  id?: number;
  documentType: string;
  document: {
    document_url: string;
    document_binary_url: string;
    document_filename: string;
    document_hash?: string;
  };
  contentType?: string;
  sizeInBytes?: number;
}

export interface DisplayDocument {
  index: number;
  id?: number;
  document_url: string;
  document_filename: string;
  content_type?: string;
  sizeInBytes?: number;
}

type PtApiApplication = Record<string, Record<string, unknown> | unknown>;

export const toDisplayDocuments = (docs: CcdUploadedDocument[]): DisplayDocument[] =>
  docs.map((doc, index) => ({
    index,
    id: doc.id,
    document_url: doc.document.document_url,
    document_filename: doc.document.document_filename,
    content_type: doc.contentType,
    sizeInBytes: doc.sizeInBytes,
  }));

export const cdamToCcdDocument = (cdamDoc: CdamDocument, field: DocumentFieldDefinition): CcdUploadedDocument => ({
  documentType: field.documentType,
  document: {
    document_url: cdamDoc.document_url,
    document_binary_url: cdamDoc.document_binary_url,
    document_filename: cdamDoc.document_filename,
    document_hash: cdamDoc.document_hash,
  },
  contentType: cdamDoc.content_type,
  sizeInBytes: cdamDoc.size,
});

const ptApiToCcdDocument = (doc: PtApiDocument, field: DocumentFieldDefinition): CcdUploadedDocument | undefined => {
  if (!doc?.url || !doc.binaryUrl) {
    return undefined;
  }
  return {
    id: doc.id,
    documentType: field.documentType,
    document: {
      document_url: doc.url,
      document_binary_url: doc.binaryUrl,
      document_filename: doc.filename ?? '',
    },
    contentType: doc.contentType,
    sizeInBytes: doc.size,
  };
};

const readSlice = (application: PtApiApplication, field: DocumentFieldDefinition): unknown => {
  const slice = application?.[field.slice] as Record<string, unknown> | undefined;
  return slice?.[field.ptApiField];
};

export const readAllDocuments = async (req: Request): Promise<Record<string, CcdUploadedDocument[]>> => {
  const caseReference = String(req.params.caseReference);
  const application = (await getPtApi(req.session.user).getCaseByCaseReference(
    caseReference
  )) as unknown as PtApiApplication;

  const result: Record<string, CcdUploadedDocument[]> = {};

  for (const [key, field] of Object.entries(DOCUMENT_FIELDS)) {
    const raw = readSlice(application, field);
    const docs = (Array.isArray(raw) ? raw : [raw])
      .map(doc => ptApiToCcdDocument(doc as PtApiDocument, field))
      .filter((doc): doc is CcdUploadedDocument => doc !== undefined);

    result[key] = docs;
  }

  return result;
};

export const readDocuments = async (req: Request, fieldKey: string): Promise<CcdUploadedDocument[]> =>
  (await readAllDocuments(req))[fieldKey] ?? [];

const toPayload = (field: DocumentFieldDefinition, docs: CcdUploadedDocument[]): Record<string, unknown> => ({
  [field.ccdField]: field.multiple ? docs.map(value => ({ value })) : (docs[0] ?? null),
});

const submitEvent = async (req: Request, eventName: string, data: Record<string, unknown>): Promise<void> => {
  const caseReference = String(req.params.caseReference);
  const caseApi = getCaseApi(req.session.user);

  const payload = { documentIdToDelete: null, ...data };

  const { token } = await caseApi.getEventTrigger(caseReference, eventName);
  await caseApi.triggerEvent(caseReference, payload, eventName, token);
};

export const saveDocuments = async (req: Request, fieldKey: string, docs: CcdUploadedDocument[]): Promise<void> => {
  const field = documentFieldFor(fieldKey);
  if (!field) {
    throw new Error(`Unknown document field ${fieldKey}`);
  }

  await submitEvent(req, CITIZEN_UPLOAD_DOCUMENT, toPayload(field, docs));
  logger.info('Saved documents', { fieldKey, count: docs.length });
};

export const deleteDocumentById = async (req: Request, documentId: number): Promise<void> => {
  await submitEvent(req, CITIZEN_DELETE_DOCUMENT, { documentIdToDelete: String(documentId) });
  logger.info('Deleted document', { documentId });
};
