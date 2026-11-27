import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { buildSectionCyaRows } from '../../../../main/steps/application/landlord-details/check-your-answers-landlord-details/buildSectionCyaRows';

const t = ((key: string) => key) as unknown as TFunction;

type Row = { key: { text: string }; value: { text?: string; html?: string }; actions: { items: { href: string }[] } };

const CASE_REF = '1234123412341234';

const buildReq = (
  formData: Record<string, unknown> = {},
  savedLandlordDetails: Record<string, unknown> = {},
  savedCaseReference = CASE_REF
): Request =>
  ({
    params: { caseReference: CASE_REF },
    session: {
      formData: { [CASE_REF]: formData },
      ccdCase: { caseReference: savedCaseReference, landlordDetails: savedLandlordDetails },
    },
  }) as unknown as Request;

const rowsFor = (req: Request): Row[] => buildSectionCyaRows(req, t) as Row[];

const summarise = (rows: Row[]) => rows.map(row => [row.key.text, row.value.text ?? row.value.html]);

describe('buildSectionCyaRows for landlord details', () => {
  it('returns no rows when the route has no case reference', () => {
    expect(buildSectionCyaRows({ session: {} } as unknown as Request, t)).toEqual([]);
  });

  it('returns no rows when nothing has been answered', () => {
    expect(rowsFor(buildReq())).toEqual([]);
  });

  it('shows an individual landlord from the form data', () => {
    const rows = rowsFor(
      buildReq({
        'landlord-individual-or-organisation': {
          landlordIndividualOrOrganisation: 'individual',
          'landlordIndividualOrOrganisation.landlordFirstName': 'John',
          'landlordIndividualOrOrganisation.landlordLastName': 'Smith',
        },
        'landlord-address': { landlordAddressLine1: '1 High Street', landlordPostTown: 'Leeds' },
        'landlord-email-address': { landlordEmailAddress: 'landlord@example.com' },
        'landlord-phone-number': { landlordPhoneNumber: '07123 456789' },
        'landlord-has-representative': { landlordHasRepresentative: 'No' },
      })
    );

    expect(summarise(rows)).toEqual([
      ['rows.landlordIndividualOrOrganisation.label', 'rows.landlordIndividualOrOrganisation.options.individual'],
      ['rows.landlordFirstName.label', 'John'],
      ['rows.landlordLastName.label', 'Smith'],
      ['rows.landlordAddress.label', '1 High Street<br>Leeds'],
      ['rows.landlordEmailAddress.label', 'landlord@example.com'],
      ['rows.landlordPhoneNumber.label', '07123 456789'],
      ['rows.landlordHasRepresentative.label', 'rows.landlordHasRepresentative.options.No'],
    ]);
  });

  it('shows the organisation name for an organisation landlord', () => {
    const rows = rowsFor(
      buildReq({
        'landlord-individual-or-organisation': {
          landlordIndividualOrOrganisation: 'organisation',
          'landlordIndividualOrOrganisation.landlordOrganisationName': 'Smith Properties Ltd',
        },
      })
    );

    expect(summarise(rows)).toEqual([
      ['rows.landlordIndividualOrOrganisation.label', 'rows.landlordIndividualOrOrganisation.options.organisation'],
      ['rows.landlordOrganisationName.label', 'Smith Properties Ltd'],
    ]);
  });

  it('shows the representative answers when the landlord has a representative', () => {
    const rows = rowsFor(
      buildReq({
        'landlord-has-representative': { landlordHasRepresentative: 'Yes' },
        'landlord-representative-details': {
          representativeFirstName: 'Alex',
          representativeLastName: 'Jones',
          representativeCompanyName: 'Jones Lettings',
        },
        'landlord-representative-address': { representativeAddressLine1: '2 Low Road', representativePostTown: 'York' },
        'landlord-representative-email-address': { representativeEmailAddress: 'agent@example.com' },
        'landlord-representative-phone-number': { representativePhoneNumber: '01904 123456' },
      })
    );

    expect(summarise(rows)).toEqual([
      ['rows.landlordHasRepresentative.label', 'rows.landlordHasRepresentative.options.Yes'],
      ['rows.representativeFirstName.label', 'Alex'],
      ['rows.representativeLastName.label', 'Jones'],
      ['rows.representativeCompanyName.label', 'Jones Lettings'],
      ['rows.representativeAddress.label', '2 Low Road<br>York'],
      ['rows.representativeEmailAddress.label', 'agent@example.com'],
      ['rows.representativePhoneNumber.label', '01904 123456'],
    ]);
  });

  it('leaves out the representative answers when the landlord has no representative', () => {
    const rows = rowsFor(
      buildReq(
        { 'landlord-has-representative': { landlordHasRepresentative: 'No' } },
        { representative: { firstName: 'Alex', lastName: 'Jones' } }
      )
    );

    expect(summarise(rows)).toEqual([
      ['rows.landlordHasRepresentative.label', 'rows.landlordHasRepresentative.options.No'],
    ]);
  });

  it('falls back to the saved case when there is no form data', () => {
    const rows = rowsFor(
      buildReq(
        {},
        {
          landlord: { organisationName: 'Smith Properties Ltd', emailAddress: 'landlord@example.com' },
          hasRepresentative: 'Yes',
          representative: { firstName: 'Alex', lastName: 'Jones' },
        }
      )
    );

    expect(summarise(rows)).toEqual([
      ['rows.landlordIndividualOrOrganisation.label', 'rows.landlordIndividualOrOrganisation.options.organisation'],
      ['rows.landlordOrganisationName.label', 'Smith Properties Ltd'],
      ['rows.landlordEmailAddress.label', 'landlord@example.com'],
      ['rows.landlordHasRepresentative.label', 'rows.landlordHasRepresentative.options.Yes'],
      ['rows.representativeFirstName.label', 'Alex'],
      ['rows.representativeLastName.label', 'Jones'],
    ]);
  });

  it('prefers form data over the saved case', () => {
    const rows = rowsFor(
      buildReq(
        { 'landlord-email-address': { landlordEmailAddress: 'amended@example.com' } },
        { landlord: { emailAddress: 'landlord@example.com' } }
      )
    );

    expect(summarise(rows)).toEqual([['rows.landlordEmailAddress.label', 'amended@example.com']]);
  });

  it('ignores the saved case when it belongs to a different case', () => {
    expect(rowsFor(buildReq({}, { landlord: { firstName: 'John' } }, '9999999999999999'))).toEqual([]);
  });

  it('points each change link at the page that asked the question', () => {
    const rows = rowsFor(
      buildReq({
        'landlord-individual-or-organisation': {
          landlordIndividualOrOrganisation: 'individual',
          'landlordIndividualOrOrganisation.landlordFirstName': 'John',
          'landlordIndividualOrOrganisation.landlordLastName': 'Smith',
        },
        'landlord-address': { landlordAddressLine1: '1 High Street' },
        'landlord-email-address': { landlordEmailAddress: 'landlord@example.com' },
        'landlord-phone-number': { landlordPhoneNumber: '07123 456789' },
        'landlord-has-representative': { landlordHasRepresentative: 'Yes' },
        'landlord-representative-details': {
          representativeFirstName: 'Alex',
          representativeLastName: 'Jones',
          representativeCompanyName: 'Jones Lettings',
        },
        'landlord-representative-address': { representativeAddressLine1: '2 Low Road' },
        'landlord-representative-email-address': { representativeEmailAddress: 'agent@example.com' },
        'landlord-representative-phone-number': { representativePhoneNumber: '01904 123456' },
      })
    );

    expect(rows.map(row => row.actions.items[0].href)).toEqual([
      `/${CASE_REF}/landlord-individual-or-organisation?edit=landlordDetails`,
      `/${CASE_REF}/landlord-individual-or-organisation?edit=landlordDetails`,
      `/${CASE_REF}/landlord-individual-or-organisation?edit=landlordDetails`,
      `/${CASE_REF}/landlord-address?edit=landlordDetails`,
      `/${CASE_REF}/landlord-email-address?edit=landlordDetails`,
      `/${CASE_REF}/landlord-phone-number?edit=landlordDetails`,
      `/${CASE_REF}/landlord-has-representative?edit=landlordDetails`,
      `/${CASE_REF}/landlord-representative-details?edit=landlordDetails`,
      `/${CASE_REF}/landlord-representative-details?edit=landlordDetails`,
      `/${CASE_REF}/landlord-representative-details?edit=landlordDetails`,
      `/${CASE_REF}/landlord-representative-address?edit=landlordDetails`,
      `/${CASE_REF}/landlord-representative-email-address?edit=landlordDetails`,
      `/${CASE_REF}/landlord-representative-phone-number?edit=landlordDetails`,
    ]);
  });
});
