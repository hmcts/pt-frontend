import express, { type Express } from 'express';
import request from 'supertest';

import { deleteDocumentById, readDocuments, saveDocuments } from '@modules/documents/storage';
import documentProxy from '@routes/documentProxy';
import { deleteDocument, uploadDocument } from '@services/cdamService';

jest.mock('@modules/logger', () => ({
  Logger: {
    getLogger: jest.fn(() => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() })),
  },
}));
jest.mock('@services/cdamService');
jest.mock('@modules/documents/storage', () => ({
  ...jest.requireActual('@modules/documents/storage'),
  readDocuments: jest.fn(),
  saveDocuments: jest.fn(),
  deleteDocumentById: jest.fn(),
}));
jest.mock('../../../main/middleware/oidc', () => ({
  oidcMiddleware: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

const mockedUploadDocument = uploadDocument as jest.MockedFunction<typeof uploadDocument>;
const mockedDeleteDocument = deleteDocument as jest.MockedFunction<typeof deleteDocument>;
const mockedReadDocuments = readDocuments as jest.MockedFunction<typeof readDocuments>;
const mockedSaveDocuments = saveDocuments as jest.MockedFunction<typeof saveDocuments>;
const mockedDeleteById = deleteDocumentById as jest.MockedFunction<typeof deleteDocumentById>;

const CASE_REFERENCE = '1234123412341234';
const SINGLE_URL = `/${CASE_REFERENCE}/documents/floorPlanDocument`;
const COLLECTION_URL = `/${CASE_REFERENCE}/documents/roomsDocuments`;

const cdamDocument = {
  document_url: 'http://cdam/cases/documents/abc',
  document_binary_url: 'http://cdam/cases/documents/abc/binary',
  document_filename: 'floor-plan.pdf',
  document_hash: 'hash',
  content_type: 'application/pdf',
  size: 5,
};

const storedDocument = (id: number, url: string, filename = 'floor-plan.pdf') => ({
  id,
  documentType: 'floorPlan',
  document: {
    document_url: url,
    document_binary_url: `${url}/binary`,
    document_filename: filename,
  },
});

const buildApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as unknown as { session: unknown }).session = { user: { accessToken: 'user-token' } };
    next();
  });
  documentProxy(app);
  return app;
};

describe('documentProxy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedReadDocuments.mockResolvedValue([]);
    mockedSaveDocuments.mockResolvedValue(undefined);
    mockedDeleteById.mockResolvedValue(undefined);
    mockedUploadDocument.mockResolvedValue(cdamDocument);
    mockedDeleteDocument.mockResolvedValue(undefined);
  });

  describe('upload', () => {
    // The route reads the case three times: to check the field is free, again under the lock,
    // then after saving to pick up the new row id.
    const persistedAs = (id: number, filename = 'floor-plan.pdf') => {
      mockedReadDocuments.mockResolvedValueOnce([]);
      mockedReadDocuments.mockResolvedValueOnce([]);
      mockedReadDocuments.mockResolvedValue([storedDocument(id, cdamDocument.document_url, filename)]);
    };

    test('uploads to CDAM then persists the reference against the case', async () => {
      persistedAs(42);

      const response = await request(buildApp())
        .post(`${SINGLE_URL}/upload`)
        .attach('documents', Buffer.from('a pdf'), 'floor-plan.pdf');

      expect(response.status).toBe(200);
      expect(mockedUploadDocument).toHaveBeenCalled();
      expect(mockedSaveDocuments).toHaveBeenCalledWith(
        expect.anything(),
        'floorPlanDocument',
        expect.arrayContaining([expect.objectContaining({ documentType: 'floorPlan' })])
      );
    });

    test('returns the persisted row id as the delete key', async () => {
      persistedAs(42);

      const response = await request(buildApp())
        .post(`${SINGLE_URL}/upload`)
        .attach('documents', Buffer.from('a pdf'), 'floor-plan.pdf');

      expect(response.body).toEqual({
        success: { messageHtml: 'floor-plan.pdf', messageText: 'floor-plan.pdf' },
        file: { filename: '42', originalname: 'floor-plan.pdf' },
      });
    });

    test('fails the upload if the document did not persist, rather than reporting success', async () => {
      mockedReadDocuments.mockResolvedValue([]);

      const response = await request(buildApp())
        .post(`${SINGLE_URL}/upload`)
        .attach('documents', Buffer.from('a pdf'), 'floor-plan.pdf');

      expect(response.status).toBe(500);
      expect(mockedDeleteDocument).toHaveBeenCalledWith(cdamDocument.document_url, 'user-token');
    });

    test('escapes the filename it echoes back, since the component injects it as HTML', async () => {
      mockedUploadDocument.mockResolvedValue({
        ...cdamDocument,
        document_filename: '<img src=x onerror=alert(1)>.pdf',
      });
      persistedAs(42, '<img src=x onerror=alert(1)>.pdf');

      const response = await request(buildApp())
        .post(`${SINGLE_URL}/upload`)
        .attach('documents', Buffer.from('a pdf'), 'x.pdf');

      expect(response.body.success.messageHtml).not.toContain('<img');
      expect(response.body.success.messageHtml).toContain('&#60;');
    });

    test('sends only the new document, letting pt-api upsert it', async () => {
      mockedReadDocuments.mockResolvedValue([storedDocument(1, cdamDocument.document_url)]);

      await request(buildApp()).post(`${COLLECTION_URL}/upload`).attach('documents', Buffer.from('a pdf'), 'room.pdf');

      const [, , docs] = mockedSaveDocuments.mock.calls[0];
      expect(docs).toHaveLength(1);
      expect(docs[0].document.document_url).toBe(cdamDocument.document_url);
    });

    test('refuses a second file on a field that holds one, without calling CDAM', async () => {
      mockedReadDocuments.mockResolvedValue([storedDocument(42, cdamDocument.document_url)]);

      const response = await request(buildApp())
        .post(`${SINGLE_URL}/upload`)
        .attach('documents', Buffer.from('x'), 'another.pdf');

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Remove the uploaded file');
      expect(mockedUploadDocument).not.toHaveBeenCalled();
      expect(mockedSaveDocuments).not.toHaveBeenCalled();
    });

    test('refuses a file that arrives while another request is saving, and clears it from CDAM', async () => {
      mockedReadDocuments.mockResolvedValueOnce([]);
      mockedReadDocuments.mockResolvedValue([storedDocument(42, 'http://cdam/cases/documents/first')]);

      const response = await request(buildApp())
        .post(`${SINGLE_URL}/upload`)
        .attach('documents', Buffer.from('x'), 'another.pdf');

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Remove the uploaded file');
      expect(mockedSaveDocuments).not.toHaveBeenCalled();
      expect(mockedDeleteDocument).toHaveBeenCalledWith(cdamDocument.document_url, 'user-token');
    });

    test('allows a further file on a collection field', async () => {
      const first = storedDocument(42, 'http://cdam/cases/documents/first');
      mockedReadDocuments.mockResolvedValueOnce([first]);
      mockedReadDocuments.mockResolvedValueOnce([first]);
      mockedReadDocuments.mockResolvedValue([first, storedDocument(43, cdamDocument.document_url, 'room.pdf')]);

      const response = await request(buildApp())
        .post(`${COLLECTION_URL}/upload`)
        .attach('documents', Buffer.from('x'), 'room.pdf');

      expect(response.status).toBe(200);
      expect(response.body.file.filename).toBe('43');
    });

    test('rejects a disallowed file type without calling CDAM', async () => {
      const response = await request(buildApp())
        .post(`${SINGLE_URL}/upload`)
        .attach('documents', Buffer.from('MZ'), 'virus.exe');

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBeTruthy();
      expect(mockedUploadDocument).not.toHaveBeenCalled();
    });

    test('rejects a request with no file', async () => {
      const response = await request(buildApp()).post(`${SINGLE_URL}/upload`);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBeTruthy();
    });

    test('rejects an unknown document field without calling CDAM', async () => {
      const response = await request(buildApp())
        .post(`/${CASE_REFERENCE}/documents/notAField/upload`)
        .attach('documents', Buffer.from('a pdf'), 'floor-plan.pdf');

      expect(response.status).toBe(500);
      expect(mockedUploadDocument).not.toHaveBeenCalled();
    });

    test('removes the CDAM document when it cannot be saved to the case', async () => {
      mockedSaveDocuments.mockRejectedValue(new Error('CCD is down'));

      const response = await request(buildApp())
        .post(`${SINGLE_URL}/upload`)
        .attach('documents', Buffer.from('a pdf'), 'floor-plan.pdf');

      expect(response.status).toBe(500);
      expect(mockedDeleteDocument).toHaveBeenCalledWith(cdamDocument.document_url, 'user-token');
    });
  });

  describe('delete', () => {
    test('deletes the document named by id through pt-api', async () => {
      const target = storedDocument(42, 'http://cdam/cases/documents/abc');
      mockedReadDocuments.mockResolvedValue([target]);

      const response = await request(buildApp()).post(`${SINGLE_URL}/delete`).send({ delete: '42' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(mockedDeleteById).toHaveBeenCalledWith(expect.anything(), 42);
      expect(mockedDeleteDocument).not.toHaveBeenCalled();
      expect(mockedSaveDocuments).not.toHaveBeenCalled();
    });

    test('deletes only the document with that id when the field holds several', async () => {
      const keep = storedDocument(1, 'http://cdam/cases/documents/keep', 'keep.pdf');
      const remove = storedDocument(2, 'http://cdam/cases/documents/remove', 'remove.pdf');
      mockedReadDocuments.mockResolvedValue([keep, remove]);

      await request(buildApp()).post(`${COLLECTION_URL}/delete`).send({ delete: '2' });

      expect(mockedDeleteById).toHaveBeenCalledWith(expect.anything(), 2);
      expect(mockedDeleteById).toHaveBeenCalledTimes(1);
    });

    test('is idempotent when the document is already gone', async () => {
      mockedReadDocuments.mockResolvedValue([]);

      const response = await request(buildApp()).post(`${SINGLE_URL}/delete`).send({ delete: '42' });

      expect(response.status).toBe(200);
      expect(mockedDeleteById).not.toHaveBeenCalled();
    });

    test.each([{}, { delete: '' }, { delete: 'not-a-number' }, { delete: '-1' }])(
      'rejects a delete that names no valid document id (%p)',
      async body => {
        const response = await request(buildApp()).post(`${SINGLE_URL}/delete`).send(body);

        expect(response.status).toBe(400);
        expect(mockedDeleteById).not.toHaveBeenCalled();
      }
    );
  });
});
