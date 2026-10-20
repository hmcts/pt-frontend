import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { buildSectionCyaRows } from '../../../../main/steps/application/tenant-details/check-your-answers-tenant-details/buildSectionCyaRows';

const t = ((key: string) => key) as unknown as TFunction;

type Row = { key: { text: string }; value: { text?: string }; actions: { items: { href: string }[] } };

const CASE_REF = '1234123412341234';

const buildReq = (
  yourInformation?: Record<string, unknown>,
  savedCase: Record<string, unknown> = {},
  savedCaseReference = CASE_REF
): Request =>
  ({
    params: { caseReference: CASE_REF },
    session: {
      formData: { [CASE_REF]: yourInformation ? { 'your-information': yourInformation } : {} },
      ccdCase: { caseReference: savedCaseReference, ...savedCase },
    },
  }) as unknown as Request;

const rowsFor = (req: Request): Row[] => buildSectionCyaRows(req, t) as Row[];

const summarise = (rows: Row[]) => rows.map(row => [row.key.text, row.value.text]);

describe('buildSectionCyaRows for tenant details', () => {
  it('returns no rows when the route has no case reference', () => {
    expect(buildSectionCyaRows({ session: {} } as unknown as Request, t)).toEqual([]);
  });

  it('returns no rows when nothing has been answered', () => {
    expect(rowsFor(buildReq())).toEqual([]);
  });

  it('shows every answer from the form data', () => {
    const rows = rowsFor(
      buildReq({
        applicantFirstName: 'Jane',
        applicantLastName: 'Smith',
        companyName: 'Smith Lettings',
        referenceNumberForCommunications: 'REF-1',
      })
    );

    expect(summarise(rows)).toEqual([
      ['rows.applicantFirstName.label', 'Jane'],
      ['rows.applicantLastName.label', 'Smith'],
      ['rows.companyName.label', 'Smith Lettings'],
      ['rows.referenceNumberForCommunications.label', 'REF-1'],
    ]);
  });

  it('falls back to the saved case when there is no form data', () => {
    const rows = rowsFor(
      buildReq(undefined, {
        applicantFirstName: 'Jane',
        applicantLastName: 'Smith',
        tenantDetails: { companyName: 'Smith Lettings', referenceNumberForCommunications: 'REF-1' },
      })
    );

    expect(summarise(rows)).toEqual([
      ['rows.applicantFirstName.label', 'Jane'],
      ['rows.applicantLastName.label', 'Smith'],
      ['rows.companyName.label', 'Smith Lettings'],
      ['rows.referenceNumberForCommunications.label', 'REF-1'],
    ]);
  });

  it('prefers form data over the saved case', () => {
    const rows = rowsFor(
      buildReq(
        { applicantFirstName: 'Janet', applicantLastName: 'Smyth' },
        { applicantFirstName: 'Jane', applicantLastName: 'Smith' }
      )
    );

    expect(summarise(rows)).toEqual([
      ['rows.applicantFirstName.label', 'Janet'],
      ['rows.applicantLastName.label', 'Smyth'],
    ]);
  });

  it('leaves out the optional answers the citizen did not give', () => {
    const rows = rowsFor(buildReq({ applicantFirstName: 'Jane', applicantLastName: 'Smith' }));

    expect(summarise(rows)).toEqual([
      ['rows.applicantFirstName.label', 'Jane'],
      ['rows.applicantLastName.label', 'Smith'],
    ]);
  });

  it('ignores the saved case when it belongs to a different case', () => {
    expect(rowsFor(buildReq(undefined, { applicantFirstName: 'Jane' }, '9999999999999999'))).toEqual([]);
  });

  it('points each change link at the your information page', () => {
    const rows = rowsFor(buildReq({ applicantFirstName: 'Jane', applicantLastName: 'Smith' }));

    expect(rows.map(row => row.actions.items[0].href)).toEqual([
      '/1234123412341234/your-information?edit=whoIsOnTheTenancy',
      '/1234123412341234/your-information?edit=whoIsOnTheTenancy',
    ]);
  });
});
