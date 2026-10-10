import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { buildSectionCyaRows } from '../../../../main/steps/application/inspection-and-hearing/check-your-answers-inspection-and-hearing/buildSectionCyaRows';

const t = ((key: string) => key) as unknown as TFunction;

const CASE_REF = '1234123412341234';

const buildReq = (formData: Record<string, unknown> = {}, hearingInspectionDetails: Record<string, unknown> = {}) =>
  ({
    params: { caseReference: CASE_REF },
    session: {
      formData: { [CASE_REF]: formData },
      ccdCase: { caseReference: CASE_REF, hearingInspectionDetails },
    },
  }) as unknown as Request;

const keysOf = (rows: ReturnType<typeof buildSectionCyaRows>) => rows.map(row => row.key.text);
const valuesOf = (rows: ReturnType<typeof buildSectionCyaRows>) => rows.map(row => row.value.text ?? row.value.html);

describe('buildSectionCyaRows for inspection and hearing', () => {
  it('returns no rows when the route has no case reference', () => {
    const req = { session: {} } as unknown as Request;

    expect(buildSectionCyaRows(req, t)).toEqual([]);
  });

  it('shows only the two questions when both answers are Yes', () => {
    const rows = buildSectionCyaRows(
      buildReq({
        'property-inspection': {
          agreeToDecisionWithoutInspection: 'Yes',
          'agreeToDecisionWithoutInspection.noDecisionWithoutInspectionReason': 'stale reason',
        },
        hearing: {
          agreeToDecisionWithoutHearing: 'Yes',
          'agreeToDecisionWithoutHearing.noDecisionWithoutHearingReason': 'stale reason',
        },
      }),
      t
    );

    expect(keysOf(rows)).toEqual([
      'rows.agreeToDecisionWithoutInspection.label',
      'rows.agreeToDecisionWithoutHearing.label',
    ]);
  });

  it('shows each reason under its question when both answers are No', () => {
    const rows = buildSectionCyaRows(
      buildReq({
        'property-inspection': {
          agreeToDecisionWithoutInspection: 'No',
          'agreeToDecisionWithoutInspection.noDecisionWithoutInspectionReason': 'Damp\nin the <b>bedroom</b>',
        },
        hearing: {
          agreeToDecisionWithoutHearing: 'No',
          'agreeToDecisionWithoutHearing.noDecisionWithoutHearingReason': 'I want to attend',
        },
      }),
      t
    );

    expect(keysOf(rows)).toEqual([
      'rows.agreeToDecisionWithoutInspection.label',
      'rows.noDecisionWithoutInspectionReason.label',
      'rows.agreeToDecisionWithoutHearing.label',
      'rows.noDecisionWithoutHearingReason.label',
    ]);
    expect(valuesOf(rows)).toEqual([
      'rows.agreeToDecisionWithoutInspection.options.No',
      'Damp<br>in the &lt;b&gt;bedroom&lt;/b&gt;',
      'rows.agreeToDecisionWithoutHearing.options.No',
      'I want to attend',
    ]);
  });

  it('flips the saved hearingRequested back to the answer the citizen gave', () => {
    const rows = buildSectionCyaRows(
      buildReq(
        {},
        {
          agreeToDecisionWithoutInspection: 'Yes',
          hearingRequested: 'Yes',
          reasonHearingRequested: 'I want to attend',
        }
      ),
      t
    );

    expect(valuesOf(rows)).toEqual([
      'rows.agreeToDecisionWithoutInspection.options.Yes',
      'rows.agreeToDecisionWithoutHearing.options.No',
      'I want to attend',
    ]);
  });

  it('links each row to the page that asked the question', () => {
    const rows = buildSectionCyaRows(
      buildReq({
        'property-inspection': {
          agreeToDecisionWithoutInspection: 'No',
          'agreeToDecisionWithoutInspection.noDecisionWithoutInspectionReason': 'Damp',
        },
        hearing: { agreeToDecisionWithoutHearing: 'Yes' },
      }),
      t
    );

    expect(rows.map(row => row.actions?.items[0].href.split('?')[0])).toEqual([
      `/${CASE_REF}/property-inspection`,
      `/${CASE_REF}/property-inspection`,
      `/${CASE_REF}/hearing`,
    ]);
  });
});
