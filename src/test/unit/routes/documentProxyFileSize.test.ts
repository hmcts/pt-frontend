import express, { type Express } from 'express';
import request from 'supertest';

import documentProxy from '@routes/documentProxy';
import { uploadDocument } from '@services/cdamService';

jest.mock('config', () => {
  const limits: Record<string, number> = {
    'documentUpload.maxFileSizeMB': 1,
    'documentUpload.maxTotalFileSizeMB': 500,
    'documentUpload.maxFilenameLength': 255,
  };
  return { has: (key: string) => key in limits, get: (key: string) => limits[key] };
});
jest.mock('@modules/logger', () => ({
  Logger: {
    getLogger: jest.fn(() => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() })),
  },
}));
jest.mock('@services/cdamService');
jest.mock('@modules/documents/storage', () => ({
  readDocuments: jest.fn().mockResolvedValue([]),
  saveDocuments: jest.fn(),
  deleteDocumentById: jest.fn(),
  cdamToCcdDocument: jest.fn(),
}));
jest.mock('../../../main/middleware/oidc', () => ({
  oidcMiddleware: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

const buildApp = (): Express => {
  const app = express();
  app.use((req, _res, next) => {
    (req as unknown as { session: unknown }).session = { user: { accessToken: 'user-token' } };
    next();
  });
  documentProxy(app);
  return app;
};

describe('documentProxy file size limit', () => {
  test('reports an oversized file in the shape the upload component reads', async () => {
    const response = await request(buildApp())
      .post('/1234123412341234/documents/floorPlanDocument/upload')
      .attach('documents', Buffer.alloc(2 * 1024 * 1024), 'floor-plan.pdf');

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('This file is too large');
    expect(uploadDocument).not.toHaveBeenCalled();
  });
});
