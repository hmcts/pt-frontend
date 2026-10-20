import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { buildSectionCyaRows } from '../../../../main/steps/application/application-documents/your-tenancy-agreement/check-your-answers-your-tenancy-agreement/buildSectionCyaRows';

const t = ((key: string) => key) as unknown as TFunction;

type Row = { key: { text: string }; value: { text?: string }; actions: { items: { href: string }[] } };

const CASE_REF = '1234123412341234';

const buildReq = (
  formData: Record<string, unknown> = {},
  tenancyAgreementDetails?: Record<string, unknown>,
  savedCaseReference = CASE_REF
): Request =>
  ({
    params: { caseReference: CASE_REF },
    session: {
      formData: { [CASE_REF]: formData },
      ccdCase: { caseReference: savedCaseReference, tenancyAgreementDetails },
    },
  }) as unknown as Request;

const rowsFor = (req: Request): Row[] => buildSectionCyaRows(req, t) as Row[];

const summarise = (rows: Row[]) => rows.map(row => [row.key.text, row.value.text]);

describe('buildSectionCyaRows for the tenancy agreement', () => {
  it('returns no rows when the route has no case reference', () => {
    expect(buildSectionCyaRows({ session: {} } as unknown as Request, t)).toEqual([]);
  });

  it('returns no rows when nothing has been answered', () => {
    expect(rowsFor(buildReq())).toEqual([]);
  });

  it('shows the answer and the uploaded file name when the citizen has a copy', () => {
    const rows = rowsFor(
      buildReq({
        'have-tenancy-agreement': { copyOfTenancyAgreement: 'Yes' },
        'upload-tenancy-agreement': { documents: [{ index: 0, document_filename: 'tenancy.pdf' }] },
      })
    );

    expect(summarise(rows)).toEqual([
      ['rows.copyOfTenancyAgreement.label', 'rows.copyOfTenancyAgreement.options.Yes'],
      ['rows.tenancyAgreementDocument.label', 'tenancy.pdf'],
    ]);
  });

  it('shows the answer and the reason when the citizen has no copy', () => {
    const rows = rowsFor(
      buildReq(
        {
          'have-tenancy-agreement': {
            copyOfTenancyAgreement: 'No',
            'copyOfTenancyAgreement.noTenancyAgreementReason': 'Never given one',
          },
        },
        { tenancyAgreementDocument: { filename: 'old.pdf' } }
      )
    );

    expect(summarise(rows)).toEqual([
      ['rows.copyOfTenancyAgreement.label', 'rows.copyOfTenancyAgreement.options.No'],
      ['rows.noTenancyAgreementReason.label', 'Never given one'],
    ]);
  });

  it('omits the reason when the citizen has a copy', () => {
    const rows = rowsFor(buildReq({}, { copyOfTenancyAgreement: 'Yes', noTenancyAgreementReason: 'Stale reason' }));

    expect(summarise(rows)).toEqual([['rows.copyOfTenancyAgreement.label', 'rows.copyOfTenancyAgreement.options.Yes']]);
  });

  it('falls back to the saved case when there is no form data', () => {
    const rows = rowsFor(
      buildReq({}, { copyOfTenancyAgreement: 'Yes', tenancyAgreementDocument: { filename: 'saved.pdf' } })
    );

    expect(summarise(rows)).toEqual([
      ['rows.copyOfTenancyAgreement.label', 'rows.copyOfTenancyAgreement.options.Yes'],
      ['rows.tenancyAgreementDocument.label', 'saved.pdf'],
    ]);
  });

  it('prefers form data over the saved case', () => {
    const rows = rowsFor(
      buildReq(
        {
          'have-tenancy-agreement': { copyOfTenancyAgreement: 'Yes' },
          'upload-tenancy-agreement': { documents: [{ index: 0, document_filename: 'new.pdf' }] },
        },
        { copyOfTenancyAgreement: 'No', tenancyAgreementDocument: { filename: 'saved.pdf' } }
      )
    );

    expect(summarise(rows)).toEqual([
      ['rows.copyOfTenancyAgreement.label', 'rows.copyOfTenancyAgreement.options.Yes'],
      ['rows.tenancyAgreementDocument.label', 'new.pdf'],
    ]);
  });

  it('ignores the saved case when it belongs to a different case', () => {
    const req = buildReq({}, { copyOfTenancyAgreement: 'Yes' }, '9999999999999999');

    expect(rowsFor(req)).toEqual([]);
  });

  it('points each change link at the step that asked the question', () => {
    const rows = rowsFor(
      buildReq({}, { copyOfTenancyAgreement: 'Yes', tenancyAgreementDocument: { filename: 'saved.pdf' } })
    );

    expect(rows.map(row => row.actions.items[0].href)).toEqual([
      '/1234123412341234/have-tenancy-agreement?edit=yourTenancyAgreement',
      '/1234123412341234/upload-tenancy-agreement?edit=yourTenancyAgreement',
    ]);
  });
});
