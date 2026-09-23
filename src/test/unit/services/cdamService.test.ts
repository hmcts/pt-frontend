import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import axios from 'axios';
import config from 'config';
import type FormData from 'form-data';

import { requireServiceAuthToken } from '../../../main/auth/service/get-service-auth-token';

import { deleteDocument, uploadDocument } from '@services/cdamService';

jest.mock('@modules/logger', () => ({
  Logger: {
    getLogger: jest.fn(() => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() })),
  },
}));
jest.mock('axios');
jest.mock('../../../main/auth/service/get-service-auth-token');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedRequireServiceAuthToken = requireServiceAuthToken as jest.MockedFunction<typeof requireServiceAuthToken>;

const CDAM_URL = config.get<string>('cdam.url');
const USER_TOKEN = 'user-token';

const FILE_CONTENT = 'a pdf';
const uploadDir = mkdtempSync(join(tmpdir(), 'cdam-service-test-'));
const uploadPath = join(uploadDir, 'floor-plan.pdf');

const file = {
  path: uploadPath,
  originalname: 'floor-plan.pdf',
  mimetype: 'application/pdf',
  size: FILE_CONTENT.length,
} as Express.Multer.File;

const readFormData = (formData: FormData): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    formData.on('data', chunk => chunks.push(Buffer.from(chunk)));
    formData.on('end', () => resolve(Buffer.concat(chunks).toString()));
    formData.on('error', reject);
    formData.resume();
  });

const cdamResponse = {
  data: {
    documents: [
      {
        originalDocumentName: 'floor-plan.pdf',
        mimeType: 'application/pdf',
        size: 5,
        classification: 'PUBLIC',
        hashToken: 'hash-token-abc',
        _links: {
          self: { href: `${CDAM_URL}/cases/documents/abc-123` },
          binary: { href: `${CDAM_URL}/cases/documents/abc-123/binary` },
        },
      },
    ],
  },
};

describe('cdamService', () => {
  let instance: { post: jest.Mock; delete: jest.Mock; get: jest.Mock };

  beforeAll(() => {
    writeFileSync(uploadPath, FILE_CONTENT);
  });

  afterAll(() => {
    rmSync(uploadDir, { force: true, recursive: true });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedRequireServiceAuthToken.mockReturnValue('s2s-token');
    instance = { post: jest.fn(), delete: jest.fn(), get: jest.fn() };
    mockedAxios.create.mockReturnValue(instance as never);
  });

  describe('uploadDocument', () => {
    test('posts the file to CDAM with both tokens and the required metadata', async () => {
      instance.post.mockResolvedValue(cdamResponse);

      await uploadDocument(file, USER_TOKEN);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: CDAM_URL,
          headers: {
            Authorization: `Bearer ${USER_TOKEN}`,
            ServiceAuthorization: 'Bearer s2s-token',
          },
        })
      );

      const [url, formData] = instance.post.mock.calls[0];
      expect(url).toBe('/cases/documents');

      const body = await readFormData(formData);
      expect(body).toContain('name="files"; filename="floor-plan.pdf"');
      expect(body).toContain(FILE_CONTENT);
      expect(body).toContain('name="classification"');
      expect(body).toContain('PUBLIC');
      expect(body).toContain('name="caseTypeId"');
      expect(body).toContain('PT');
      expect(body).toContain('name="jurisdictionId"');
    });

    test('streams the file from disk and opts out of redirect following, which retains the body', async () => {
      instance.post.mockResolvedValue(cdamResponse);

      await uploadDocument(file, USER_TOKEN);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({ maxRedirects: 0, maxBodyLength: Infinity, maxContentLength: Infinity })
      );

      const [, formData] = instance.post.mock.calls[0];
      expect(formData._streams.some((part: unknown) => Buffer.isBuffer(part))).toBe(false);
    });

    test('maps the CDAM response onto the CCD document shape, including the hash token', async () => {
      instance.post.mockResolvedValue(cdamResponse);

      const result = await uploadDocument(file, USER_TOKEN);

      expect(result).toEqual({
        document_url: `${CDAM_URL}/cases/documents/abc-123`,
        document_binary_url: `${CDAM_URL}/cases/documents/abc-123/binary`,
        document_filename: 'floor-plan.pdf',
        document_hash: 'hash-token-abc',
        content_type: 'application/pdf',
        size: 5,
      });
    });

    test('throws when CDAM returns no document', async () => {
      instance.post.mockResolvedValue({ data: { documents: [] } });

      await expect(uploadDocument(file, USER_TOKEN)).rejects.toThrow('CDAM returned no document in response');
    });

    test('fails loudly when the S2S token refresh has failed', async () => {
      mockedRequireServiceAuthToken.mockImplementation(() => {
        throw new Error('No S2S token available — the service auth token refresh has failed');
      });

      await expect(uploadDocument(file, USER_TOKEN)).rejects.toThrow(
        'No S2S token available — the service auth token refresh has failed'
      );
      expect(instance.post).not.toHaveBeenCalled();
    });
  });

  describe('deleteDocument', () => {
    test('rebuilds the path against the configured CDAM rather than following the stored href', async () => {
      instance.delete.mockResolvedValue({});

      await deleteDocument('http://some-other-host/documents/abc-123', USER_TOKEN);

      expect(instance.delete).toHaveBeenCalledWith('/cases/documents/abc-123');
    });

    test('throws on an unrecognised document URL', async () => {
      await expect(deleteDocument('http://some-other-host/nope/abc', USER_TOKEN)).rejects.toThrow(
        'Unrecognised document URL'
      );
    });
  });
});
