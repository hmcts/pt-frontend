import { readDocuments } from '@modules/documents/storage';
import { createFormStep } from '@modules/steps';

jest.mock('@modules/steps', () => ({
  createFormStep: jest.fn(),
}));
jest.mock('@modules/documents/storage', () => ({
  ...jest.requireActual('@modules/documents/storage'),
  readDocuments: jest.fn(),
}));

import './../../../../../main/steps/application/application-documents/landlords-notice/upload-landlords-notice/index';

const mockedReadDocuments = readDocuments as jest.MockedFunction<typeof readDocuments>;

const storedDocument = (filename: string) => ({
  id: 7,
  documentType: 'newRentIncreaseNotice',
  document: {
    document_url: 'http://cdam/cases/documents/abc',
    document_binary_url: 'http://cdam/cases/documents/abc/binary',
    document_filename: filename,
  },
  contentType: 'application/pdf',
  sizeInBytes: 10,
});

describe('upload-landlords-notice step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  beforeEach(() => jest.clearAllMocks());

  it('targets the landlords notice document field, so the routes and arity follow from the registry', () => {
    expect(capturedConfig.stepName).toBe('upload-landlords-notice');
    expect(capturedConfig.documentField).toBe('landlordNoticeProposingNewRentDocument');
    expect(capturedConfig.fields).toEqual([expect.objectContaining({ name: 'documents', type: 'file' })]);
  });

  it('reads documents from the case on every render, not from the session', async () => {
    mockedReadDocuments.mockResolvedValue([storedDocument('landlords-notice.pdf')]);

    const data = await capturedConfig.getInitialFormData({});

    expect(mockedReadDocuments).toHaveBeenCalledWith(expect.anything(), 'landlordNoticeProposingNewRentDocument');
    expect(data.documents).toEqual([expect.objectContaining({ id: 7, document_filename: 'landlords-notice.pdf' })]);
  });

  it('reflects a document deleted since the page was last rendered', async () => {
    mockedReadDocuments.mockResolvedValueOnce([storedDocument('landlords-notice.pdf')]).mockResolvedValueOnce([]);

    expect((await capturedConfig.getInitialFormData({})).documents).toHaveLength(1);
    expect((await capturedConfig.getInitialFormData({})).documents).toEqual([]);
  });

  it('is answered once the case holds a landlords notice', () => {
    const withDocument = {
      session: { ccdCase: { noticeOfRentIncreaseDetails: { landlordNoticeProposingNewRentDocument: { url: 'u' } } } },
    };
    const without = { session: { ccdCase: { noticeOfRentIncreaseDetails: {} } } };

    expect(capturedConfig.isAnswered(withDocument)).toBe(true);
    expect(capturedConfig.isAnswered(without)).toBe(true);
  });
});
