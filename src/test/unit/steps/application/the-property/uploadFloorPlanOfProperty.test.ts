import { readDocuments } from '@modules/documents/storage';
import { createFormStep } from '@modules/steps';

jest.mock('@modules/steps', () => ({
  createFormStep: jest.fn(),
}));
jest.mock('@modules/documents/storage', () => ({
  ...jest.requireActual('@modules/documents/storage'),
  readDocuments: jest.fn(),
}));

import './../../../../../main/steps/application/the-property/upload-floor-plan-of-property/index';

const mockedReadDocuments = readDocuments as jest.MockedFunction<typeof readDocuments>;

const storedDocument = (filename: string) => ({
  id: 7,
  documentType: 'floorPlan',
  document: {
    document_url: 'http://cdam/cases/documents/abc',
    document_binary_url: 'http://cdam/cases/documents/abc/binary',
    document_filename: filename,
  },
  contentType: 'application/pdf',
  sizeInBytes: 10,
});

describe('upload-floor-plan-of-property step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  beforeEach(() => jest.clearAllMocks());

  it('targets the floor plan document field, so the routes and arity follow from the registry', () => {
    expect(capturedConfig.stepName).toBe('upload-floor-plan-of-property');
    expect(capturedConfig.documentField).toBe('floorPlanDocument');
    expect(capturedConfig.fields).toEqual([expect.objectContaining({ name: 'documents', type: 'file' })]);
  });

  it('reads documents from the case on every render, not from the session', async () => {
    mockedReadDocuments.mockResolvedValue([storedDocument('floor-plan.pdf')]);

    const data = await capturedConfig.getInitialFormData({});

    expect(mockedReadDocuments).toHaveBeenCalledWith(expect.anything(), 'floorPlanDocument');
    expect(data.documents).toEqual([expect.objectContaining({ id: 7, document_filename: 'floor-plan.pdf' })]);
  });

  it('reflects a document deleted since the page was last rendered', async () => {
    mockedReadDocuments.mockResolvedValueOnce([storedDocument('floor-plan.pdf')]).mockResolvedValueOnce([]);

    expect((await capturedConfig.getInitialFormData({})).documents).toHaveLength(1);
    expect((await capturedConfig.getInitialFormData({})).documents).toEqual([]);
  });

  it('is answered once the case holds a floor plan', () => {
    const withDocument = { session: { ccdCase: { propertyDetails: { floorPlanDocument: { url: 'u' } } } } };
    const without = { session: { ccdCase: { propertyDetails: {} } } };

    expect(capturedConfig.isAnswered(withDocument)).toBe(true);
    expect(capturedConfig.isAnswered(without)).toBe(false);
  });
});
