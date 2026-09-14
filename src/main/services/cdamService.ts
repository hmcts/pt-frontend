import axios, { AxiosInstance } from 'axios';
import config from 'config';
import FormData from 'form-data';

import { getServiceAuthToken } from '../auth/service/get-service-auth-token';

import { Logger } from '@modules/logger';
import type { CdamDocument, CdamRawDocument, CdamUploadResponse } from '@services/documentUpload.interface';

const logger = Logger.getLogger('cdamService');

const CLASSIFICATION = 'PUBLIC';
const JURISDICTION = 'PT';

const getCdamUrl = (): string => config.get('cdam.url');
const getCaseTypeId = (): string => config.get('ccd.caseTypeId');

const requireServiceAuthToken = (): string => {
  const serviceAuthToken = getServiceAuthToken();
  if (!serviceAuthToken) {
    throw new Error('No S2S token available — the service auth token refresh has failed');
  }
  return serviceAuthToken;
};

const cdamClient = (userToken: string): AxiosInstance =>
  axios.create({
    baseURL: getCdamUrl(),
    headers: {
      Authorization: `Bearer ${userToken}`,
      ServiceAuthorization: `Bearer ${requireServiceAuthToken()}`,
    },
  });

export const uploadDocument = async (file: Express.Multer.File, userToken: string): Promise<CdamDocument> => {
  const formData = new FormData();
  formData.append('files', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });
  formData.append('classification', CLASSIFICATION);
  formData.append('caseTypeId', getCaseTypeId());
  formData.append('jurisdictionId', JURISDICTION);

  const response = await cdamClient(userToken).post<CdamUploadResponse>('/cases/documents', formData, {
    headers: formData.getHeaders(),
  });

  const raw: CdamRawDocument | undefined = response.data?.documents?.[0];
  if (!raw?._links?.self?.href) {
    throw new Error('CDAM returned no document in response');
  }

  const filename = raw.originalDocumentName || file.originalname;
  logger.info('Document uploaded to CDAM', { filename });

  return {
    document_url: raw._links.self.href,
    document_binary_url: raw._links.binary.href,
    document_filename: filename,
    document_hash: raw.hashToken,
    content_type: raw.mimeType || file.mimetype,
    size: raw.size ?? file.size,
  };
};

const toCdamPath = (documentUrl: string): string => {
  const documentsIndex = documentUrl.lastIndexOf('/documents/');
  if (documentsIndex < 0) {
    throw new Error('Unrecognised document URL');
  }
  return `/cases${documentUrl.slice(documentsIndex)}`;
};

export const deleteDocument = async (documentUrl: string, userToken: string): Promise<void> => {
  await cdamClient(userToken).delete(toCdamPath(documentUrl));
  logger.info('Document deleted from CDAM');
};
