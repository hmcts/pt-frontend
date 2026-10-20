import type { Request } from 'express';

import { readDocuments } from '@modules/documents/storage';
import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/application-documents/your-tenancy-agreement/upload-tenancy-agreement/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

jest.mock('@modules/documents/storage', () => ({
  ...jest.requireActual('@modules/documents/storage'),
  readDocuments: jest.fn(),
}));

const mockedReadDocuments = readDocuments as jest.MockedFunction<typeof readDocuments>;

describe('application upload-tenancy-agreement step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  beforeEach(() => jest.clearAllMocks());

  describe('isAnswered', () => {
    const isAnswered = (tenancyAgreementDetails?: Record<string, unknown>): boolean =>
      capturedConfig.isAnswered({ session: { ccdCase: { tenancyAgreementDetails } } } as unknown as Request);

    it('is answered once the case holds the tenancy agreement', () => {
      expect(isAnswered({ tenancyAgreementDocument: { url: 'http://pt-api/documents/1', filename: 'a.pdf' } })).toBe(
        true
      );
    });

    it('is not answered when no agreement has been uploaded', () => {
      expect(isAnswered()).toBe(false);
      expect(isAnswered({ copyOfTenancyAgreement: 'Yes' })).toBe(false);
    });
  });

  describe('getInitialFormData', () => {
    it('reads the tenancy agreement from the case and returns it for display', async () => {
      mockedReadDocuments.mockResolvedValue([
        {
          id: 3,
          documentType: 'tenancyAgreement',
          document: {
            document_url: 'http://cdam/cases/documents/abc',
            document_binary_url: 'http://cdam/cases/documents/abc/binary',
            document_filename: 'tenancy.pdf',
          },
          contentType: 'application/pdf',
          sizeInBytes: 10,
        },
      ]);
      const req = {} as Request;

      const data = await capturedConfig.getInitialFormData(req);

      expect(mockedReadDocuments).toHaveBeenCalledWith(req, 'tenancyAgreementDocument');
      expect(data).toEqual({
        documents: [
          {
            index: 0,
            id: 3,
            document_url: 'http://cdam/cases/documents/abc',
            document_filename: 'tenancy.pdf',
            content_type: 'application/pdf',
            sizeInBytes: 10,
          },
        ],
      });
    });

    it('returns no documents when nothing has been uploaded', async () => {
      mockedReadDocuments.mockResolvedValue([]);

      expect(await capturedConfig.getInitialFormData({} as Request)).toEqual({ documents: [] });
    });
  });
});
