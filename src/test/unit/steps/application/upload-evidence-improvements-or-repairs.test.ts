import { readDocuments } from '@modules/documents/storage';
import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/upload-evidence-improvements-or-repairs/index';

jest.mock('@modules/steps', () => ({
  createFormStep: jest.fn(),
}));
jest.mock('@modules/documents/storage', () => ({
  ...jest.requireActual('@modules/documents/storage'),
  readDocuments: jest.fn(),
}));

const mockedReadDocuments = readDocuments as jest.MockedFunction<typeof readDocuments>;

const storedDocument = (filename: string) => ({
  id: 7,
  documentType: 'tenantRepairsEvidence',
  document: {
    document_url: 'http://cdam/cases/documents/abc',
    document_binary_url: 'http://cdam/cases/documents/abc/binary',
    document_filename: filename,
  },
  contentType: 'video/mp4',
  sizeInBytes: 10,
});

describe('application upload-evidence-improvements-or-repairs step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  beforeEach(() => jest.clearAllMocks());

  it('reads the repairs evidence from the case', async () => {
    mockedReadDocuments.mockResolvedValue([storedDocument('leaking-roof.mp4')]);

    const data = await capturedConfig.getInitialFormData({});

    expect(mockedReadDocuments).toHaveBeenCalledWith(expect.anything(), 'repairsEvidenceDocuments');
    expect(data.documents).toEqual([expect.objectContaining({ id: 7, document_filename: 'leaking-roof.mp4' })]);
  });

  it('shows no documents when the case holds none', async () => {
    mockedReadDocuments.mockResolvedValue([]);

    expect(await capturedConfig.getInitialFormData({})).toEqual({ documents: [] });
  });
});
