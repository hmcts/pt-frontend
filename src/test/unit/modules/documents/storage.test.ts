import type { Request } from 'express';

import { deleteDocumentById, readAllDocuments, readDocuments, saveDocuments } from '@modules/documents/storage';
import { getCaseApi } from '@services/ccdApiClient';
import { getPtApi } from '@services/ptApi/ptApiClient';

jest.mock('@modules/logger', () => ({
  Logger: {
    getLogger: jest.fn(() => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() })),
  },
}));
jest.mock('@services/ccdApiClient');
jest.mock('@services/ptApi/ptApiClient');

const mockedGetCaseApi = getCaseApi as jest.MockedFunction<typeof getCaseApi>;
const mockedGetPtApi = getPtApi as jest.MockedFunction<typeof getPtApi>;

const CASE_REFERENCE = '1234123412341234';

const req = () => ({ params: { caseReference: CASE_REFERENCE }, session: { user: {} } }) as unknown as Request;

const ptApiDocument = (name: string) => ({
  url: `http://cdam/cases/documents/${name}`,
  binaryUrl: `http://cdam/cases/documents/${name}/binary`,
  filename: `${name}.pdf`,
  contentType: 'application/pdf',
  size: 100,
});

describe('document storage', () => {
  let getEventTrigger: jest.Mock;
  let triggerEvent: jest.Mock;
  let getCaseByCaseReference: jest.Mock;

  const givenCase = (application: unknown) => getCaseByCaseReference.mockResolvedValue(application);

  beforeEach(() => {
    jest.clearAllMocks();
    getEventTrigger = jest.fn().mockResolvedValue({ token: 'event-token' });
    triggerEvent = jest.fn().mockResolvedValue({});
    getCaseByCaseReference = jest.fn().mockResolvedValue({});
    mockedGetCaseApi.mockReturnValue({ getEventTrigger, triggerEvent } as never);
    mockedGetPtApi.mockReturnValue({ getCaseByCaseReference } as never);
  });

  describe('reading', () => {
    test('reads documents from pt-api, which nests them by slice', async () => {
      givenCase({
        propertyDetails: { floorPlanDocument: ptApiDocument('floor-plan') },
        noticeOfRentIncreaseDetails: { noticeNotLegallyValidDocument: ptApiDocument('notice') },
      });

      const all = await readAllDocuments(req());

      expect(all.floorPlanDocument).toEqual([
        {
          documentType: 'floorPlan',
          document: {
            document_url: 'http://cdam/cases/documents/floor-plan',
            document_binary_url: 'http://cdam/cases/documents/floor-plan/binary',
            document_filename: 'floor-plan.pdf',
          },
          contentType: 'application/pdf',
          sizeInBytes: 100,
        },
      ]);
      expect(all.noticeNotLegallyValidDocument).toHaveLength(1);
      expect(all.outsidePropertyDocument).toEqual([]);
    });

    test('reads collection fields as lists', async () => {
      givenCase({
        propertyDetails: { propertyRoomsDocuments: [ptApiDocument('room-1'), ptApiDocument('room-2')] },
      });

      expect(await readDocuments(req(), 'roomsDocuments')).toHaveLength(2);
    });

    test('ignores documents pt-api returns without usable URLs', async () => {
      givenCase({ propertyDetails: { floorPlanDocument: { filename: 'orphan.pdf' } } });

      expect(await readDocuments(req(), 'floorPlanDocument')).toEqual([]);
    });

    test('copes with a case that has no documents at all', async () => {
      givenCase({});

      expect(await readDocuments(req(), 'floorPlanDocument')).toEqual([]);
    });
  });

  describe('saving', () => {
    const newDocument = {
      documentType: 'floorPlan',
      document: {
        document_url: 'http://cdam/cases/documents/new',
        document_binary_url: 'http://cdam/cases/documents/new/binary',
        document_filename: 'new.pdf',
        document_hash: 'hash-abc',
      },
      contentType: 'application/pdf',
      sizeInBytes: 10,
    };

    test('submits a real CCD event, so data-store attaches the document and clears its TTL', async () => {
      await saveDocuments(req(), 'floorPlanDocument', [newDocument]);

      expect(getEventTrigger).toHaveBeenCalledWith(CASE_REFERENCE, 'citizen-upload-document');
      const [caseId, data, eventName, token] = triggerEvent.mock.calls[0];
      expect(caseId).toBe(CASE_REFERENCE);
      expect(eventName).toBe('citizen-upload-document');
      expect(token).toBe('event-token');
      expect(data).toMatchObject({ propertyDetailsFloorPlanDocument: newDocument });
      expect(getCaseByCaseReference).not.toHaveBeenCalled();
    });

    test('carries the document hash, which the event submit verifies', async () => {
      await saveDocuments(req(), 'floorPlanDocument', [newDocument]);

      expect(triggerEvent.mock.calls[0][1].propertyDetailsFloorPlanDocument.document.document_hash).toBe('hash-abc');
    });

    test('wraps collection fields in CCD collection items', async () => {
      await saveDocuments(req(), 'roomsDocuments', [newDocument]);

      expect(triggerEvent.mock.calls[0][1]).toMatchObject({
        propertyDetailsRoomsDocuments: [{ value: newDocument }],
      });
    });

    test('rejects an unknown document field', async () => {
      await expect(saveDocuments(req(), 'notAField', [newDocument])).rejects.toThrow(
        'Unknown document field notAField'
      );
      expect(triggerEvent).not.toHaveBeenCalled();
    });
  });

  describe('deleting', () => {
    test('clears the control field on an upload, so a spent id is not carried forward', async () => {
      await saveDocuments(req(), 'floorPlanDocument', [
        {
          documentType: 'floorPlan',
          document: {
            document_url: 'u',
            document_binary_url: 'b',
            document_filename: 'f.pdf',
          },
        },
      ]);

      expect(triggerEvent.mock.calls[0][1].documentIdToDelete).toBeNull();
    });

    test('submits its own event naming the document by row id', async () => {
      await deleteDocumentById(req(), 42);

      expect(getEventTrigger).toHaveBeenCalledWith(CASE_REFERENCE, 'citizen-delete-document');
      const [, data, eventName] = triggerEvent.mock.calls[0];
      expect(eventName).toBe('citizen-delete-document');
      expect(data).toEqual({ documentIdToDelete: '42' });
    });

    test('never removes a document through the upload event', async () => {
      await deleteDocumentById(req(), 42);

      expect(triggerEvent).toHaveBeenCalledTimes(1);
      expect(triggerEvent.mock.calls[0][2]).not.toBe('citizen-upload-document');
    });
  });
});
