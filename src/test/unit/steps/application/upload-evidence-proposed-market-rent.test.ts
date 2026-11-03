import { readDocuments } from '@modules/documents/storage';
import { createFormStep } from '@modules/steps';

jest.mock('@modules/steps', () => ({
  createFormStep: jest.fn(),
}));
jest.mock('@modules/documents/storage', () => ({
  ...jest.requireActual('@modules/documents/storage'),
  readDocuments: jest.fn(),
}));

import './../../../../main/steps/application/the-rent/what-you-think-market-rent-should-be/upload-evidence-proposed-market-rent/index';

const mockedReadDocuments = readDocuments as jest.MockedFunction<typeof readDocuments>;

describe('upload-evidence-proposed-market-rent step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  it('reads the evidence from the case on every render, not from the session', async () => {
    mockedReadDocuments.mockResolvedValue([
      {
        id: 7,
        documentType: 'tenantProposedRentEvidence',
        document: {
          document_url: 'http://cdam/cases/documents/abc',
          document_binary_url: 'http://cdam/cases/documents/abc/binary',
          document_filename: 'evidence.pdf',
        },
      },
    ]);

    const data = await capturedConfig.getInitialFormData({});

    expect(mockedReadDocuments).toHaveBeenCalledWith(expect.anything(), 'suggestedMarketRentEvidence');
    expect(data.documents).toEqual([expect.objectContaining({ id: 7, document_filename: 'evidence.pdf' })]);
  });
});
