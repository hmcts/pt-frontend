import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { buildSectionCyaRows } from '../../../../main/steps/application/application-documents/landlords-notice/check-your-answers-landlords-notice/buildSectionCyaRows';

const t = ((key: string) => key) as unknown as TFunction;

type Row = { key: { text: string }; value: { text?: string }; actions: { items: { href: string }[] } };

const CASE_REF = '1234123412341234';

const buildReq = (
  formData: Record<string, unknown> = {},
  noticeOfRentIncreaseDetails?: Record<string, unknown>,
  savedCaseReference = CASE_REF
): Request =>
  ({
    params: { caseReference: CASE_REF },
    session: {
      formData: { [CASE_REF]: formData },
      ccdCase: { caseReference: savedCaseReference, noticeOfRentIncreaseDetails },
    },
  }) as unknown as Request;

const rowsFor = (req: Request): Row[] => buildSectionCyaRows(req, t) as Row[];

const summarise = (rows: Row[]) => rows.map(row => [row.key.text, row.value.text]);

describe('buildSectionCyaRows for landlords notice', () => {
  it('returns no rows when the route has no case reference', () => {
    expect(buildSectionCyaRows({ session: {} } as unknown as Request, t)).toEqual([]);
  });

  it('returns no rows when nothing has been answered', () => {
    expect(rowsFor(buildReq())).toEqual([]);
  });

  it('shows the notice, upload, validity and hardship when the citizen has a notice', () => {
    const rows = rowsFor(
      buildReq({
        'have-landlords-notice': { receivedLandlordNoticeProposingNewRent: 'Yes' },
        'upload-landlords-notice': { documents: [{ index: 0, document_filename: 'notice.pdf' }] },
        'your-notice-proposing-a-new-rent': { noticeLegallyValid: 'Yes' },
        hardship: { rentIncreaseToCauseHardship: 'No' },
      })
    );

    expect(summarise(rows)).toEqual([
      ['rows.receivedLandlordNoticeProposingNewRent.label', 'rows.receivedLandlordNoticeProposingNewRent.options.Yes'],
      ['rows.landlordNoticeProposingNewRentDocument.label', 'notice.pdf'],
      ['rows.noticeLegallyValid.label', 'rows.noticeLegallyValid.options.Yes'],
      ['rows.rentIncreaseToCauseHardship.label', 'rows.rentIncreaseToCauseHardship.options.No'],
    ]);
  });

  it('shows the reason when the citizen has no notice and ommits the upload', () => {
    const rows = rowsFor(
      buildReq(
        {
          'have-landlords-notice': {
            receivedLandlordNoticeProposingNewRent: 'No',
            'receivedLandlordNoticeProposingNewRent.noUploadOfNoticeProposingNewRentReason': 'Never received one',
          },
        },
        { landlordNoticeProposingNewRentDocument: { filename: 'notice.pdf' } }
      )
    );

    expect(summarise(rows)).toEqual([
      ['rows.receivedLandlordNoticeProposingNewRent.label', 'rows.receivedLandlordNoticeProposingNewRent.options.No'],
      ['rows.noUploadOfNoticeProposingNewRentReason.label', 'Never received one'],
    ]);
  });

  it('shows validity and hardship followup rows when those answers need details', () => {
    const rows = rowsFor(
      buildReq({
        'your-notice-proposing-a-new-rent': {
          noticeLegallyValid: 'No',
          'noticeLegallyValid.noticeNotLegallyValidDetails': 'Some not legally valid details',
        },
        'upload-evidence-notice-not-legally-valid': {
          documents: [
            { index: 0, document_filename: 'evidence.pdf' },
            { index: 1, document_filename: 'evidence2.pdf' },
          ],
        },
        hardship: {
          rentIncreaseToCauseHardship: 'Yes',
          'rentIncreaseToCauseHardship.rentIncreaseToCauseHardshipDetails': 'Some hardship details',
        },
        'upload-evidence-experience-hardship': {
          documents: [
            { index: 0, document_filename: 'evidence.pdf' },
            { index: 1, document_filename: 'evidence2.pdf' },
          ],
        },
      })
    );

    expect(summarise(rows)).toEqual([
      ['rows.noticeLegallyValid.label', 'rows.noticeLegallyValid.options.No'],
      ['rows.noticeNotLegallyValidDetails.label', 'Some not legally valid details'],
      ['rows.noticeNotLegallyValidDocuments.label', 'evidence.pdf, evidence2.pdf'],
      ['rows.rentIncreaseToCauseHardship.label', 'rows.rentIncreaseToCauseHardship.options.Yes'],
      ['rows.rentIncreaseToCauseHardshipDetails.label', 'Some hardship details'],
      ['rows.rentIncreaseToCauseHardshipDocuments.label', 'evidence.pdf, evidence2.pdf'],
    ]);
  });

  it('omits conditional followup rows when they do not apply', () => {
    const rows = rowsFor(
      buildReq(
        {},
        {
          receivedLandlordNoticeProposingNewRent: 'Yes',
          noUploadOfNoticeProposingNewRentReason: 'Never received one',
          noticeLegallyValid: 'Yes',
          noticeNotLegallyValidDetails: 'Some not legally valid details',
          noticeNotLegallyValidDocuments: [{ filename: 'evidence.pdf' }],
          rentIncreaseToCauseHardship: 'No',
          rentIncreaseToCauseHardshipDetails: 'Some hardship details',
          rentIncreaseToCauseHardshipDocuments: [{ filename: 'evidence.pdf' }],
        }
      )
    );

    expect(summarise(rows)).toEqual([
      ['rows.receivedLandlordNoticeProposingNewRent.label', 'rows.receivedLandlordNoticeProposingNewRent.options.Yes'],
      ['rows.noticeLegallyValid.label', 'rows.noticeLegallyValid.options.Yes'],
      ['rows.rentIncreaseToCauseHardship.label', 'rows.rentIncreaseToCauseHardship.options.No'],
    ]);
  });
});
