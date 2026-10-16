import { readDocuments } from '@modules/documents/storage';
import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/upload-photo-of-each-room/index';

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
  documentType: 'propertyRooms',
  document: {
    document_url: 'http://cdam/cases/documents/abc',
    document_binary_url: 'http://cdam/cases/documents/abc/binary',
    document_filename: filename,
  },
  contentType: 'image/jpeg',
  sizeInBytes: 10,
});

describe('application upload-photo-of-each-room step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  beforeEach(() => jest.clearAllMocks());

  it('reads the room photos from the case', async () => {
    mockedReadDocuments.mockResolvedValue([storedDocument('kitchen.jpg')]);

    const data = await capturedConfig.getInitialFormData({});

    expect(mockedReadDocuments).toHaveBeenCalledWith(expect.anything(), 'propertyRoomsDocuments');
    expect(data.documents).toEqual([expect.objectContaining({ id: 7, document_filename: 'kitchen.jpg' })]);
  });

  it('shows no documents when the case holds none', async () => {
    mockedReadDocuments.mockResolvedValue([]);

    expect(await capturedConfig.getInitialFormData({})).toEqual({ documents: [] });
  });
});
