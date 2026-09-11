import type { Request } from 'express';

import type { FormFieldConfig } from './formFieldConfig.interface';

import { type DocumentFieldKey, documentFieldFor } from '@modules/documents/documentFields';
import { readDocuments, toDisplayDocuments } from '@modules/documents/storage';

// Returns a copy rather than writing to the step's own field array, which is shared by every
// request for that step and would otherwise carry one caseReference into another request.
export const withFileUploadUrls = (
  req: Request,
  fields: FormFieldConfig[],
  documentField?: DocumentFieldKey
): FormFieldConfig[] => {
  if (!documentField) {
    return fields;
  }

  const caseReference = String(req.params?.caseReference ?? '');
  const base = `/${caseReference}/documents/${documentField}`;
  const multiple = documentFieldFor(documentField)?.multiple === true;

  return fields.map(field =>
    field.type === 'file' ? { ...field, uploadUrl: `${base}/upload`, deleteUrl: `${base}/delete`, multiple } : field
  );
};

export const setFileFieldValues = async (
  req: Request,
  fields: FormFieldConfig[],
  documentField?: DocumentFieldKey
): Promise<void> => {
  if (!documentField || !fields.some(field => field.type === 'file')) {
    return;
  }

  const documents = toDisplayDocuments(await readDocuments(req, documentField));

  for (const field of fields) {
    if (field.type === 'file') {
      // undefined rather than [], so the required check in validateForm treats no files as missing
      req.body[field.name] = documents.length > 0 ? documents : undefined;
    }
  }
};
