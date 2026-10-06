import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';

import { Application, NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { oidcMiddleware } from '../middleware/oidc';

import {
  type DocumentFieldDefinition,
  documentFieldFor,
  largestFileSizeMB,
  maxFileSizeMBForFile,
  uploadLimitsFor,
} from '@modules/documents/documentFields';
import {
  type CcdUploadedDocument,
  cdamToCcdDocument,
  deleteDocumentById,
  readDocuments,
  saveDocuments,
} from '@modules/documents/storage';
import { Logger } from '@modules/logger';
import { CdamUploadRejected, deleteDocument, uploadDocument } from '@services/cdamService';
import { maxFileSizeBytes, validateUploadedFile } from '@utils/documentUploadValidation';

const logger = Logger.getLogger('documentProxy');

const uploadByLimit = new Map<number, ReturnType<typeof multer>>();

const uploaderFor = (field: DocumentFieldDefinition): ReturnType<typeof multer> => {
  const limitBytes = maxFileSizeBytes(largestFileSizeMB(field));
  let instance = uploadByLimit.get(limitBytes);
  if (!instance) {
    instance = multer({
      // Disk storage keeps the whole file out of the heap; memory storage buffers it, and a large enough
      // buffer kills the process as soon as anything tries to serialise it.
      dest: tmpdir(),
      limits: {
        fileSize: limitBytes,
        // Limit how large an array index can be in a field name to reduce DoS risk
        fieldArrayIndexLimit: 100,
      } as multer.Options['limits'],
    });
    uploadByLimit.set(limitBytes, instance);
  }
  return instance;
};

const UPLOAD_REJECTIONS = ['removeFileFirst', 'totalTooLarge'];

const callbackErrorsOf = (err: unknown): string[] => {
  const response = (err as { response?: { status?: number; data?: { callbackErrors?: string[] } } })?.response;
  return response?.status === 422 ? (response.data?.callbackErrors ?? []) : [];
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
  (key: string, options: Record<string, unknown> = {}): string => {
    const translate = req.t;
    const fallbacks: Record<string, string> = {
      noFileSelected: 'Select a file to upload',
      wrongFileType: 'This file type is not accepted',
      fileTooLarge: 'This file is too large',
      totalTooLarge: 'Total upload size must not exceed 300MB',
      fileEmpty: 'The selected file is empty',
      passwordProtected: 'The selected file is password protected',
      filenameTooLong: 'This file name is too long',
      uploadFailed: 'This file could not be uploaded',
      deleteFailed: 'This file could not be removed',
      onlyOneFile: 'You can only upload one file',
      removeFileFirst: 'Remove the uploaded file before adding another',
    };
    const fallback = fallbacks[key] ?? fallbacks.uploadFailed;
    return typeof translate === 'function'
      ? String(translate(`errors.documentUpload.${key}`, fallback, options))
      : fallback;
  };

export default function (app: Application): void {
  app.post(
    '/:caseReference/documents/:field/upload',
    oidcMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      const field = documentFieldFor(fieldKeyOf(req));
      if (!field) {
        res.status(400).json(uploadError(getTranslations(req)('uploadFailed')));
        return;
      }

      uploaderFor(field).single('documents')(req, res, (err: unknown) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          res
            .status(400)
            .json(uploadError(getTranslations(req)('fileTooLarge', { maxFileSize: largestFileSizeMB(field) })));
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

        const validationError = validateUploadedFile(
          file,
          totalBytes(existing),
          uploadLimitsFor(field, file.originalname)
        );
        if (validationError) {
          res
            .status(400)
            .json(uploadError(t(validationError, { maxFileSize: maxFileSizeMBForFile(field, file.originalname) })));
          return;
        }

        const cdamDoc = await uploadDocument(file, getUserToken(req));
        const entry = cdamToCcdDocument(cdamDoc, field);

        try {
          await saveDocuments(req, fieldKeyOf(req), [entry]).catch(err => {
            const rejection = callbackErrorsOf(err).find(key => UPLOAD_REJECTIONS.includes(key));
            throw rejection ? new UploadRejected(rejection) : err;
          });

          const saved = await readDocuments(req, fieldKeyOf(req));
          const documentId = saved.find(doc => doc.document.document_url === cdamDoc.document_url)?.id;

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
        if (err instanceof CdamUploadRejected) {
          res.status(400).json(uploadError(t(err.reason)));
          return;
        }
        logger.error('Document upload failed', err);
        res.status(500).json(uploadError(t('uploadFailed')));
      } finally {
        const uploadPath = req.file?.path;
        if (uploadPath) {
          await unlink(uploadPath).catch(cleanupError =>
            logger.error('Failed to remove temporary upload file', cleanupError)
          );
        }
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

      const current = await readDocuments(req, fieldKeyOf(req));
      if (current.some(doc => doc.id === documentId)) {
        await deleteDocumentById(req, documentId);
      }

      res.json({ success: true });
    } catch (err) {
      logger.error('Document delete failed', err);
      res.status(500).json(uploadError(t('deleteFailed')));
    }
  });
}
