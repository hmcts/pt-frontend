import type { Request } from 'express';

import { buildSectionCyaRows } from '../../../../../main/steps/application/your-application/contact-preferences/check-your-answers-contact-preferences/buildSectionCyaRows';

import type { PTCaseData } from '@services/ccdCase.interface';

const CASE_REF = '1234123412341234';
const OTHER_CASE = '9999999999999999';
const t = ((key: string) => key) as never;

const answersFor = (caseReference: string) => ({
  [caseReference]: {
    'text-updates': {
      textUpdates: 'Yes',
      'textUpdates.textUpdatesPhoneNumber': `mobile-${caseReference}`,
    },
    'contact-by-phone': { phoneNumberForCalls: `phone-${caseReference}` },
  },
});

const savedFor = (caseReference: string) =>
  ({
    caseReference: BigInt(caseReference),
    applicantContactPreferences: {
      contactByText: 'No',
      phoneNumber: `saved-phone-${caseReference}`,
    },
  }) as unknown as PTCaseData;

const req = (route: string, formData: Record<string, unknown>, ccdCase?: PTCaseData) =>
  ({ params: { caseReference: route }, session: { formData, ccdCase } }) as unknown as Request;

const values = (rows: ReturnType<typeof buildSectionCyaRows>) => rows.map(row => row.value.text);
const hrefs = (rows: ReturnType<typeof buildSectionCyaRows>) =>
  rows.map(row => row.actions?.items[0].href?.split('?')[0]);

describe('buildSectionCyaRows', () => {
  it('renders this case answers when no case has been loaded', () => {
    const rows = buildSectionCyaRows(req(OTHER_CASE, answersFor(OTHER_CASE)), t);

    expect(values(rows)).toEqual(['rows.textUpdates.options.Yes', `mobile-${OTHER_CASE}`, `phone-${OTHER_CASE}`]);
  });

  it('renders this case answers when the session holds a different case', () => {
    const rows = buildSectionCyaRows(req(OTHER_CASE, answersFor(OTHER_CASE), savedFor(CASE_REF)), t);

    expect(values(rows)).toEqual(['rows.textUpdates.options.Yes', `mobile-${OTHER_CASE}`, `phone-${OTHER_CASE}`]);
  });

  it('never falls back to a different case saved answers', () => {
    const rows = buildSectionCyaRows(req(OTHER_CASE, {}, savedFor(CASE_REF)), t);

    expect(rows).toEqual([]);
  });

  it('falls back to saved answers when they belong to this case', () => {
    const rows = buildSectionCyaRows(req(OTHER_CASE, {}, savedFor(OTHER_CASE)), t);

    expect(values(rows)).toEqual(['rows.textUpdates.options.No', `saved-phone-${OTHER_CASE}`]);
  });

  it('builds change links from the route, not the loaded case', () => {
    const rows = buildSectionCyaRows(req(OTHER_CASE, answersFor(OTHER_CASE), savedFor(CASE_REF)), t);

    expect(hrefs(rows)).toEqual([
      `/${OTHER_CASE}/text-updates`,
      `/${OTHER_CASE}/text-updates`,
      `/${OTHER_CASE}/contact-by-phone`,
    ]);
  });

  it('renders nothing when the route carries no valid case reference', () => {
    const noRoute = { params: {}, session: { formData: {} } } as unknown as Request;

    expect(buildSectionCyaRows(noRoute, t)).toEqual([]);
  });
});
