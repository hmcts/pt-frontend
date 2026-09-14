import axios from 'axios';
import config from 'config';

import { getServiceAuthToken } from '../../../main/auth/service/get-service-auth-token';

import { deleteDocument, uploadDocument } from '@services/cdamService';

jest.mock('@modules/logger', () => ({
  Logger: {
    getLogger: jest.fn(() => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() })),
  },
}));
jest.mock('axios');
jest.mock('../../../main/auth/service/get-service-auth-token');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetServiceAuthToken = getServiceAuthToken as jest.MockedFunction<typeof getServiceAuthToken>;

const CDAM_URL = config.get<string>('cdam.url');
const USER_TOKEN = 'user-token';

const file = {
  buffer: Buffer.from('a pdf'),
  originalname: 'floor-plan.pdf',
  mimetype: 'application/pdf',
  size: 5,
} as Express.Multer.File;

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

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServiceAuthToken.mockReturnValue('s2s-token');
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

      const body = formData.getBuffer().toString();
      expect(body).toContain('name="files"; filename="floor-plan.pdf"');
      expect(body).toContain('name="classification"');
      expect(body).toContain('PUBLIC');
      expect(body).toContain('name="caseTypeId"');
      expect(body).toContain('PT');
      expect(body).toContain('name="jurisdictionId"');
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
      mockedGetServiceAuthToken.mockReturnValue(undefined as unknown as string);

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
