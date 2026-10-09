import express, { type Application, type Express } from 'express';
import request from 'supertest';

type StoredDoc = {
  id: number;
  field: string;
  documentType: string;
  sizeInBytes?: number;
  document: { document_url: string; document_binary_url: string; document_filename: string };
};

const mockState = {
  docs: [] as StoredDoc[],
  nextId: 1,
  nextUpload: 1,
  deletedFromCdam: [] as string[],
  eventChain: Promise.resolve() as Promise<unknown>,
};

const mockTick = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 10));

jest.mock('@modules/logger', () => ({
  Logger: {
    getLogger: () => ({ error: () => undefined, info: () => undefined, warn: () => undefined, debug: () => undefined }),
  },
}));

jest.mock('../../../main/middleware/oidc', () => ({
  oidcMiddleware: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock('@services/cdamService', () => ({
  ...jest.requireActual('@services/cdamService'),
  uploadDocument: async () => {
    const n = mockState.nextUpload++;
    return {
      document_url: `http://cdam/cases/documents/${n}`,
      document_binary_url: `http://cdam/cases/documents/${n}/binary`,
      document_filename: `tenancy-${n}.pdf`,
      document_hash: 'hash',
      content_type: 'application/pdf',
      size: 5,
    };
  },
  deleteDocument: async (url: string) => {
    mockState.deletedFromCdam.push(url);
  },
}));

// Stands in for CCD + pt-api: events for a case run one at a time, as the SDK's row lock makes them.
jest.mock('@modules/documents/storage', () => ({
  ...jest.requireActual('@modules/documents/storage'),
  readDocuments: async (_req: unknown, field: string) => {
    await mockTick();
    return mockState.docs.filter(doc => doc.field === field).map(doc => ({ ...doc }));
  },
  saveDocuments: async (_req: unknown, field: string, docs: Omit<StoredDoc, 'id' | 'field'>[]) => {
    await mockTick();
    const run = mockState.eventChain.then(async () => {
      await mockTick();
      if (mockState.docs.some(doc => doc.field === field)) {
        throw Object.assign(new Error('Request failed with status code 422'), {
          response: { status: 422, data: { callbackErrors: ['removeFileFirst'] } },
        });
      }
      for (const doc of docs) {
        mockState.docs.push({ ...doc, field, id: mockState.nextId++ });
      }
    });
    mockState.eventChain = run.catch(() => undefined);
    return run;
  },
  deleteDocumentById: async () => undefined,
}));

const SINGLE_URL = '/1234123412341234/documents/tenancyAgreementDocument/upload';

const pod = (): Express => {
  let register: ((app: Application) => void) | undefined;
  jest.isolateModules(() => {
    register = require('@routes/documentProxy').default;
  });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as unknown as { session: unknown }).session = { user: { accessToken: 'user-token' } };
    next();
  });
  register!(app);
  return app;
};

const uploadOn = (app: Express, name: string) =>
  request(app).post(SINGLE_URL).attach('documents', Buffer.from('a pdf'), name);

describe('documentProxy across two pods', () => {
  beforeEach(() => {
    mockState.docs = [];
    mockState.nextId = 1;
    mockState.nextUpload = 1;
    mockState.deletedFromCdam = [];
    mockState.eventChain = Promise.resolve();
  });

  test('only one simultaneous upload to a single-file field lands; the other is told to remove first', async () => {
    const [podA, podB] = [pod(), pod()];

    const responses = await Promise.all([uploadOn(podA, 'a.pdf'), uploadOn(podB, 'b.pdf')]);

    expect(responses.map(r => r.status).sort()).toEqual([200, 400]);
    const rejected = responses.find(r => r.status === 400)!;
    expect(rejected.body.error.message).toBe('Remove the uploaded file before adding another');
    expect(mockState.docs).toHaveLength(1);
    expect(mockState.deletedFromCdam).toHaveLength(1);
    expect(mockState.deletedFromCdam[0]).not.toBe(mockState.docs[0].document.document_url);
  });
});
