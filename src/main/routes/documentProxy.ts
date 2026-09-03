import { Application, NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { oidcMiddleware } from '../middleware/oidc';

import { type DocumentFieldDefinition, documentFieldFor } from '@modules/documents/documentFields';
import {
  type CcdUploadedDocument,
  cdamToCcdDocument,
  deleteDocumentById,
  readDocuments,
  saveDocuments,
} from '@modules/documents/storage';
import { Logger } from '@modules/logger';
import { deleteDocument, uploadDocument } from '@services/cdamService';
import { maxFileSizeBytes, validateUploadedFile } from '@utils/documentUploadValidation';

const logger = Logger.getLogger('documentProxy');

const upload = multer({ limits: { fileSize: maxFileSizeBytes() } });

const caseLocks = new Map<string, Promise<unknown>>();

const withCaseLock = async <T>(caseReference: string, fn: () => Promise<T>): Promise<T> => {
  const previous = caseLocks.get(caseReference) ?? Promise.resolve();
  const current = previous.then(fn, fn);
  caseLocks.set(
    caseReference,
    current.catch(() => undefined)
  );

  try {
    return await current;
  } finally {
    if (caseLocks.get(caseReference) === current) {
      caseLocks.delete(caseReference);
    }
  }
};

const getUserToken = (req: Request): string => {
  const token = req.session?.user?.accessToken;
  if (!token) {
    throw new Error('User not authenticated');
  }
  return token;
};

const param = (req: Request, name: string): string => String(req.params[name] ?? '');

const fieldKeyOf = (req: Request): string => param(req, 'field');

const getField = (req: Request): DocumentFieldDefinition => {
  const field = documentFieldFor(fieldKeyOf(req));
  if (!field) {
    throw new Error(`Unknown document field ${fieldKeyOf(req)}`);
  }
  return field;
};

const totalBytes = (docs: CcdUploadedDocument[]): number => docs.reduce((sum, doc) => sum + (doc.sizeInBytes ?? 0), 0);

const uploadError = (message: string): { error: { message: string } } => ({ error: { message } });

class UploadRejected extends Error {
  constructor(readonly key: string) {
    super(key);
  }
}

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);

const getTranslations =
  (req: Request) =>
  (key: string): string => {
    const translate = req.t;
    const fallbacks: Record<string, string> = {
      noFileSelected: 'Select a file to upload',
      wrongFileType: 'This file type is not accepted',
      fileTooLarge: 'This file is too large',
      totalTooLarge: 'These files are too large in total',
      filenameTooLong: 'This file name is too long',
      uploadFailed: 'This file could not be uploaded',
      deleteFailed: 'This file could not be removed',
      onlyOneFile: 'You can only upload one file',
      removeFileFirst: 'Remove the uploaded file before adding another',
    };
    const fallback = fallbacks[key] ?? fallbacks.uploadFailed;
    return typeof translate === 'function' ? String(translate(`errors.documentUpload.${key}`, fallback)) : fallback;
  };

export default function (app: Application): void {
  app.post(
    '/:caseReference/documents/:field/upload',
    oidcMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      upload.single('documents')(req, res, (err: unknown) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json(uploadError(getTranslations(req)('fileTooLarge')));
          return;
        }
        if (err) {
          next(err);
          return;
        }
        next();
      });
    },
    async (req: Request, res: Response) => {
      const t = getTranslations(req);
      try {
        const field = getField(req);
        const file = req.file;
        if (!file) {
          res.status(400).json(uploadError(t('noFileSelected')));
          return;
        }

        const existing = await readDocuments(req, fieldKeyOf(req));
        if (!field.multiple && existing.length > 0) {
          res.status(400).json(uploadError(t('removeFileFirst')));
          return;
        }

        const validationError = validateUploadedFile(file, totalBytes(existing));
        if (validationError) {
          res.status(400).json(uploadError(t(validationError)));
          return;
        }

        const cdamDoc = await uploadDocument(file, getUserToken(req));
        const entry = cdamToCcdDocument(cdamDoc, field);

        try {
          const documentId = await withCaseLock(param(req, 'caseReference'), async () => {
            // The check above races: two requests can both read a free field and both proceed.
            const held = await readDocuments(req, fieldKeyOf(req));
            if (!field.multiple && held.length > 0) {
              throw new UploadRejected('removeFileFirst');
            }

            await saveDocuments(req, fieldKeyOf(req), [entry]);

            const saved = await readDocuments(req, fieldKeyOf(req));
            return saved.find(doc => doc.document.document_url === cdamDoc.document_url)?.id;
          });

          if (documentId === undefined) {
            throw new Error('Document was not found on the case after saving');
          }

          res.json({
            success: {
              messageHtml: escapeHtml(cdamDoc.document_filename),
              messageText: cdamDoc.document_filename,
            },
            file: {
              filename: String(documentId),
              originalname: cdamDoc.document_filename,
            },
          });
        } catch (saveError) {
          await deleteDocument(cdamDoc.document_url, getUserToken(req)).catch(cleanupError =>
            logger.error('Failed to remove orphaned CDAM document', cleanupError)
          );

          if (saveError instanceof UploadRejected) {
            res.status(400).json(uploadError(t(saveError.key)));
            return;
          }

          throw saveError;
        }
      } catch (err) {
        logger.error('Document upload failed', err);
        res.status(500).json(uploadError(t('uploadFailed')));
      }
    }
  );

  app.post('/:caseReference/documents/:field/delete', oidcMiddleware, async (req: Request, res: Response) => {
    const t = getTranslations(req);
    try {
      const documentId = Number((req.body as Record<string, unknown>)?.delete);
      if (!Number.isInteger(documentId) || documentId <= 0) {
        res.status(400).json(uploadError(t('deleteFailed')));
        return;
      }

      await withCaseLock(param(req, 'caseReference'), async () => {
        const current = await readDocuments(req, fieldKeyOf(req));
        const target = current.some(doc => doc.id === documentId);
        if (!target) {
          return;
        }

        await deleteDocumentById(req, documentId);
      });

      res.json({ success: true });
    } catch (err) {
      logger.error('Document delete failed', err);
      res.status(500).json(uploadError(t('deleteFailed')));
    }
  });
}
