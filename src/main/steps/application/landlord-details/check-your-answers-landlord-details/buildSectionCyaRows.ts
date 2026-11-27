import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { SummaryListRow, createRowContext } from '../../section-cya/cyaRow';
import { ApplicationSectionId } from '../../sections.config';

import { getFormDataString } from '@modules/steps';

const SECTION_ID: ApplicationSectionId = 'landlordDetails';

export function buildSectionCyaRows(req: Request, t: TFunction): SummaryListRow[] {
  const ctx = createRowContext(req, SECTION_ID, t);
  if (!ctx) {
    return [];
  }
  const { rows, validatedCase, change } = ctx;
  const landlord = validatedCase?.landlordDetails?.landlord;
  const representative = validatedCase?.landlordDetails?.representative;

  const addRow = (field: string, value: string | undefined, changeHref: string, valueText: string = value ?? '') => {
    if (value) {
      rows.push({
        key: { text: t(`rows.${field}.label`) },
        value: { text: valueText },
        actions: { items: [change(changeHref, `rows.${field}.changeHidden`)] },
      });
    }
  };

  const landlordIndividualOrOrganisation =
    getFormDataString(req, 'landlord-individual-or-organisation', 'landlordIndividualOrOrganisation') ??
    (landlord?.organisationName ? 'organisation' : landlord?.firstName ? 'individual' : undefined);
  addRow(
    'landlordIndividualOrOrganisation',
    landlordIndividualOrOrganisation,
    'landlord-individual-or-organisation',
    landlordIndividualOrOrganisation &&
      t(`rows.landlordIndividualOrOrganisation.options.${landlordIndividualOrOrganisation}`)
  );

  if (landlordIndividualOrOrganisation === 'organisation') {
    const landlordOrganisationName =
      getFormDataString(
        req,
        'landlord-individual-or-organisation',
        'landlordIndividualOrOrganisation.landlordOrganisationName'
      ) ?? landlord?.organisationName;
    addRow('landlordOrganisationName', landlordOrganisationName, 'landlord-individual-or-organisation');
  } else {
    const landlordFirstName =
      getFormDataString(
        req,
        'landlord-individual-or-organisation',
        'landlordIndividualOrOrganisation.landlordFirstName'
      ) ?? landlord?.firstName;
    addRow('landlordFirstName', landlordFirstName, 'landlord-individual-or-organisation');

    const landlordLastName =
      getFormDataString(
        req,
        'landlord-individual-or-organisation',
        'landlordIndividualOrOrganisation.landlordLastName'
      ) ?? landlord?.lastName;
    addRow('landlordLastName', landlordLastName, 'landlord-individual-or-organisation');
  }

  const landlordAddress = [
    getFormDataString(req, 'landlord-address', 'landlordAddressLine1') ?? landlord?.addressLine1,
    getFormDataString(req, 'landlord-address', 'landlordAddressLine2') ?? landlord?.addressLine2,
    getFormDataString(req, 'landlord-address', 'landlordPostTown') ?? landlord?.postTown,
    getFormDataString(req, 'landlord-address', 'landlordCounty') ?? landlord?.county,
    getFormDataString(req, 'landlord-address', 'landlordPostcode') ?? landlord?.postcode,
    getFormDataString(req, 'landlord-address', 'landlordCountry') ?? landlord?.country,
  ]
    .filter(Boolean)
    .join('<br>');
  addRow('landlordAddress', landlordAddress, 'landlord-address');

  const landlordEmailAddress =
    getFormDataString(req, 'landlord-email-address', 'landlordEmailAddress') ?? landlord?.emailAddress;
  addRow('landlordEmailAddress', landlordEmailAddress, 'landlord-email-address');

  const landlordPhoneNumber =
    getFormDataString(req, 'landlord-phone-number', 'landlordPhoneNumber') ?? landlord?.phoneNumber;
  addRow('landlordPhoneNumber', landlordPhoneNumber, 'landlord-phone-number');

  const landlordHasRepresentative =
    getFormDataString(req, 'landlord-has-representative', 'landlordHasRepresentative') ??
    validatedCase?.landlordDetails?.hasRepresentative;
  addRow(
    'landlordHasRepresentative',
    landlordHasRepresentative,
    'landlord-has-representative',
    landlordHasRepresentative && t(`rows.landlordHasRepresentative.options.${landlordHasRepresentative}`)
  );

  if (landlordHasRepresentative !== 'Yes') {
    return rows;
  }

  const representativeFirstName =
    getFormDataString(req, 'landlord-representative-details', 'representativeFirstName') ?? representative?.firstName;
  addRow('representativeFirstName', representativeFirstName, 'landlord-representative-details');

  const representativeLastName =
    getFormDataString(req, 'landlord-representative-details', 'representativeLastName') ?? representative?.lastName;
  addRow('representativeLastName', representativeLastName, 'landlord-representative-details');

  const representativeCompanyName =
    getFormDataString(req, 'landlord-representative-details', 'representativeCompanyName') ??
    representative?.organisationName;
  addRow('representativeCompanyName', representativeCompanyName, 'landlord-representative-details');

  const representativeAddress = [
    getFormDataString(req, 'landlord-representative-address', 'representativeAddressLine1') ??
      representative?.addressLine1,
    getFormDataString(req, 'landlord-representative-address', 'representativeAddressLine2') ??
      representative?.addressLine2,
    getFormDataString(req, 'landlord-representative-address', 'representativePostTown') ?? representative?.postTown,
    getFormDataString(req, 'landlord-representative-address', 'representativeCounty') ?? representative?.county,
    getFormDataString(req, 'landlord-representative-address', 'representativePostcode') ?? representative?.postcode,
  ]
    .filter(Boolean)
    .join('<br>');
  addRow('representativeAddress', representativeAddress, 'landlord-representative-address');

  const representativeEmailAddress =
    getFormDataString(req, 'landlord-representative-email-address', 'representativeEmailAddress') ??
    representative?.emailAddress;
  addRow('representativeEmailAddress', representativeEmailAddress, 'landlord-representative-email-address');

  const representativePhoneNumber =
    getFormDataString(req, 'landlord-representative-phone-number', 'representativePhoneNumber') ??
    representative?.phoneNumber;
  addRow('representativePhoneNumber', representativePhoneNumber, 'landlord-representative-phone-number');

  return rows;
}
