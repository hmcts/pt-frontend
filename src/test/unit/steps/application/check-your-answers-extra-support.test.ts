import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { buildSectionCyaRows } from '../../../../main/steps/application/support-for-health-conditions/check-your-answers-extra-support/buildSectionCyaRows';

const t = ((key: string) => key) as unknown as TFunction;

const CASE_REF = '1234123412341234';

const buildReq = (formData: Record<string, unknown> = {}, extraSupportDetails: Record<string, unknown> = {}) =>
  ({
    params: { caseReference: CASE_REF },
    session: {
      formData: { [CASE_REF]: formData },
      ccdCase: { caseReference: CASE_REF, extraSupportDetails },
    },
  }) as unknown as Request;

const keysOf = (rows: ReturnType<typeof buildSectionCyaRows>) => rows.map(row => row.key.text);
const valuesOf = (rows: ReturnType<typeof buildSectionCyaRows>) => rows.map(row => row.value.text ?? row.value.html);

describe('buildSectionCyaRows for extra support', () => {
  it('returns no rows when the route has no case reference', () => {
    const req = { session: {} } as unknown as Request;

    expect(buildSectionCyaRows(req, t)).toEqual([]);
  });

  it('shows two rows when support is required', () => {
    const rows = buildSectionCyaRows(
      buildReq({
        'extra-support': {
          extraSupport: 'Yes',
          'extraSupport.extraSupportDetails': 'Hearing impairment',
        },
      }),
      t
    );

    expect(keysOf(rows)).toEqual(['rows.extraSupport.label', 'rows.extraSupportDetails.label']);
  });

  it('shows each reason under its question when support is required and details are provided', () => {
    const rows = buildSectionCyaRows(
      buildReq({
        'extra-support': {
          extraSupport: 'Yes',
          'extraSupport.extraSupportDetails': 'Mental health support',
        },
      }),
      t
    );

    expect(keysOf(rows)).toEqual(['rows.extraSupport.label', 'rows.extraSupportDetails.label']);
    expect(valuesOf(rows)).toEqual(['rows.extraSupport.options.Yes', 'Mental health support']);
  });

  it('only shows one row when support is not required', () => {
    const rows = buildSectionCyaRows(
      buildReq({
        'extra-support': {
          extraSupport: 'No',
        },
      }),
      t
    );

    expect(keysOf(rows)).toEqual(['rows.extraSupport.label']);
    expect(valuesOf(rows)).toEqual(['rows.extraSupport.options.No']);
  });

  it('does not show previously entered details when support is updated to not required', () => {
    const rows = buildSectionCyaRows(
      buildReq({
        'extra-support': {
          extraSupport: 'No',
          'extraSupport.extraSupportDetails': 'stale reason',
        },
      }),
      t
    );

    expect(keysOf(rows)).toEqual(['rows.extraSupport.label']);
    expect(valuesOf(rows)).toEqual(['rows.extraSupport.options.No']);
  });

  it('reads the saved answers when there is no form data', () => {
    const rows = buildSectionCyaRows(
      buildReq(
        {},
        {
          extraSupportRequired: 'Yes',
          extraSupportRequiredDetails: 'Communication difficulties',
        }
      ),
      t
    );

    expect(valuesOf(rows)).toEqual(['rows.extraSupport.options.Yes', 'Communication difficulties']);
  });

  it('links each row to the page that asked the question', () => {
    const rows = buildSectionCyaRows(
      buildReq({
        'extra-support': {
          extraSupport: 'Yes',
          'extraSupport.extraSupportDetails': 'Stuttering',
        },
      }),
      t
    );

    expect(rows.map(row => row.actions?.items[0].href.split('?')[0])).toEqual([
      `/${CASE_REF}/extra-support`,
      `/${CASE_REF}/extra-support`,
    ]);
  });
});
