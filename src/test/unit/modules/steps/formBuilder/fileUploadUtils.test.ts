import type { Request } from 'express';

import { readDocuments } from '@modules/documents/storage';
import { setFileFieldValues, withFileUploadUrls } from '@modules/steps/formBuilder/fileUploadUtils';
import type { FormFieldConfig } from '@modules/steps/formBuilder/formFieldConfig.interface';

jest.mock('@modules/documents/storage', () => ({
  ...jest.requireActual('@modules/documents/storage'),
  readDocuments: jest.fn(),
}));

const mockedReadDocuments = readDocuments as jest.MockedFunction<typeof readDocuments>;

const CASE_REFERENCE = '1234123412341234';

const req = () => ({ params: { caseReference: CASE_REFERENCE }, body: {} }) as unknown as Request;
const fileField = (): FormFieldConfig => ({ name: 'documents', type: 'file' }) as FormFieldConfig;

describe('withFileUploadUrls', () => {
  test('derives the upload and delete URLs from the document field', () => {
    const [field] = withFileUploadUrls(req(), [fileField()], 'floorPlanDocument');

    expect(field.uploadUrl).toBe(`/${CASE_REFERENCE}/documents/floorPlanDocument/upload`);
    expect(field.deleteUrl).toBe(`/${CASE_REFERENCE}/documents/floorPlanDocument/delete`);
  });

  test('marks a collection field as accepting multiple files', () => {
    const [field] = withFileUploadUrls(req(), [fileField()], 'roomsDocuments');

    expect(field.multiple).toBe(true);
  });

  test('marks a single-document field as accepting one file', () => {
    const [field] = withFileUploadUrls(req(), [fileField()], 'floorPlanDocument');

    expect(field.multiple).toBe(false);
  });

  test('leaves non-file fields alone', () => {
    const [field] = withFileUploadUrls(
      req(),
      [{ name: 'somethingElse', type: 'text' } as FormFieldConfig],
      'floorPlanDocument'
    );

    expect(field.uploadUrl).toBeUndefined();
  });

  test('does nothing for a step that declares no document field', () => {
    const [field] = withFileUploadUrls(req(), [fileField()], undefined);

    expect(field.uploadUrl).toBeUndefined();
    expect(field.multiple).toBeUndefined();
  });

  test('does not write the case reference onto the step field array shared by every request', () => {
    const stepFields = [fileField()];

    withFileUploadUrls(req(), stepFields, 'floorPlanDocument');

    expect(stepFields[0].uploadUrl).toBeUndefined();
  });

  test('gives concurrent requests for different cases their own URLs', () => {
    const stepFields = [fileField()];
    const otherReq = { params: { caseReference: '9999888877776666' }, body: {} } as unknown as Request;

    const [first] = withFileUploadUrls(req(), stepFields, 'floorPlanDocument');
    const [second] = withFileUploadUrls(otherReq, stepFields, 'floorPlanDocument');

    expect(first.uploadUrl).toBe(`/${CASE_REFERENCE}/documents/floorPlanDocument/upload`);
    expect(second.uploadUrl).toBe('/9999888877776666/documents/floorPlanDocument/upload');
  });
});

describe('setFileFieldValues', () => {
  const storedDocument = {
    id: 7,
    documentType: 'floorPlan',
    document: {
      document_url: 'http://cdam/cases/documents/abc',
      document_binary_url: 'http://cdam/cases/documents/abc/binary',
      document_filename: 'floor-plan.pdf',
    },
  };

  beforeEach(() => jest.clearAllMocks());

  test('puts the documents saved against the case onto the body', async () => {
    mockedReadDocuments.mockResolvedValue([storedDocument]);
    const request = req();

    await setFileFieldValues(request, [fileField()], 'floorPlanDocument');

    expect(request.body.documents).toHaveLength(1);
    expect(request.body.documents[0].document_filename).toBe('floor-plan.pdf');
    expect(request.body.documents[0].id).toBe(7);
  });

  test('leaves the body undefined when nothing has been uploaded, so required fails', async () => {
    mockedReadDocuments.mockResolvedValue([]);
    const request = req();

    await setFileFieldValues(request, [fileField()], 'floorPlanDocument');

    expect(request.body.documents).toBeUndefined();
  });

  test('does not read the case for a step with no file field', async () => {
    const request = req();

    await setFileFieldValues(
      request,
      [{ name: 'somethingElse', type: 'text' } as FormFieldConfig],
      'floorPlanDocument'
    );

    expect(mockedReadDocuments).not.toHaveBeenCalled();
  });

  test('does not read the case for a step that declares no document field', async () => {
    const request = req();

    await setFileFieldValues(request, [fileField()], undefined);

    expect(mockedReadDocuments).not.toHaveBeenCalled();
  });
});
