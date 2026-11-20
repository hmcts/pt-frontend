import type { Request } from 'express';

import { buildPropertyDetailsRows } from '../../../../main/steps/landlord-response/your-response/review-property-details/buildPropertyDetailsRows';

import type { PropertyDetails } from '@services/ccd/ccdCase.interface';

const CASE_REF = '1234123412341234';
const t = ((key: string) => key) as never;

const makeReq = (propertyDetails?: Partial<PropertyDetails>, caseReference = CASE_REF): Request =>
  ({
    params: { caseReference: CASE_REF },
    session: { ccdCase: { caseReference, propertyDetails } },
  }) as unknown as Request;

const rowsFor = (propertyDetails?: Partial<PropertyDetails>, caseReference?: string) =>
  buildPropertyDetailsRows(makeReq(propertyDetails, caseReference), t).map(row => [
    row.key.text,
    row.value.text ?? row.value.html,
  ]);

const file = (filename: string) => ({ url: `http://dm-store/${filename}`, filename });

const fullAnswers: Partial<PropertyDetails> = {
  addressLine1: '1 Park Mansions',
  postTown: 'London',
  postcode: 'SW1C 2TW',
  propertyType: 'flat',
  rentingFlatDetails: 'Second floor',
  propertyFloorPlanAvailable: 'Yes',
  floorPlanDocuments: [file('floorplan.pdf')],
  indoorFeatures: 'Two bedrooms\nOne <b>bathroom</b>',
  otherFacilitiesAvailable: 'Yes',
  otherFacilitiesDetails: 'A garden',
  sharePropertyWithLandlord: 'No',
  outsidePropertyDocuments: [file('outside.png')],
  propertyRoomsDocuments: [file('room1.png'), file('room2.png')],
  furnitureProvidedInTenancy: 'Yes',
  furnitureProvidedInTenancyDetails: 'Beds and a sofa',
  additionalServicesProvidedInTenancy: 'No',
  landlordRepairsDetails: 'Boiler',
  tenantRepairsDetails: 'Light bulbs',
};

describe('buildPropertyDetailsRows', () => {
  it('shows every answer the tenant gave, in the design order', () => {
    expect(rowsFor(fullAnswers)).toEqual([
      ['propertyDetails.rows.propertyAddress', '1 Park Mansions<br>London<br>SW1C 2TW'],
      ['propertyDetails.rows.propertyType', 'propertyDetails.propertyType.flat'],
      ['propertyDetails.rows.propertyFloorPlanAvailable', 'common:yes'],
      ['propertyDetails.rows.floorPlanDocuments', 'floorplan.pdf'],
      ['propertyDetails.rows.indoorFeatures', 'Two bedrooms<br>One &lt;b&gt;bathroom&lt;/b&gt;'],
      ['propertyDetails.rows.otherFacilitiesAvailable', 'A garden'],
      ['propertyDetails.rows.sharePropertyWithLandlord', 'common:no'],
      ['propertyDetails.rows.outsidePropertyDocuments', 'outside.png'],
      ['propertyDetails.rows.propertyRoomsDocuments', 'room1.png<br>room2.png'],
      ['propertyDetails.rows.furnitureProvidedInTenancy', 'common:yes'],
      ['propertyDetails.rows.furnitureProvidedInTenancyDetails', 'Beds and a sofa'],
      ['propertyDetails.rows.additionalServicesProvidedInTenancy', 'common:no'],
      ['propertyDetails.rows.landlordRepairsDetails', 'Boiler'],
      ['propertyDetails.rows.tenantRepairsDetails', 'Light bulbs'],
    ]);
  });

  it.each([
    ['3 lines', {}, '1 Park Mansions<br>London<br>SW1C 2TW'],
    ['4 lines with address line 2', { addressLine2: 'Flat 4' }, '1 Park Mansions<br>Flat 4<br>London<br>SW1C 2TW'],
    ['4 lines with county', { county: 'Greater London' }, '1 Park Mansions<br>London<br>Greater London<br>SW1C 2TW'],
    [
      '5 lines with both',
      { addressLine2: 'Flat 4', county: 'Greater London' },
      '1 Park Mansions<br>Flat 4<br>London<br>Greater London<br>SW1C 2TW',
    ],
    [
      '3 lines when the optional lines are blank',
      { addressLine2: ' ', county: '' },
      '1 Park Mansions<br>London<br>SW1C 2TW',
    ],
  ])('shows the address over %s', (_label, extra, expected) => {
    const address = { addressLine1: '1 Park Mansions', postTown: 'London', postcode: 'SW1C 2TW', ...extra };
    expect(rowsFor(address)).toEqual([['propertyDetails.rows.propertyAddress', expected]]);
  });

  it.each([
    ['room', 'rentingRoomDetails'],
    ['flat', 'rentingFlatDetails'],
    ['other', 'otherMethodRentingDetails'],
  ])('shows a %s as the type only, as the design does', (propertyType, detailsField) => {
    expect(rowsFor({ propertyType, [detailsField]: 'More about it' })).toEqual([
      ['propertyDetails.rows.propertyType', `propertyDetails.propertyType.${propertyType}`],
    ]);
  });

  it('shows a house type on its own and skips a type it does not know', () => {
    expect(rowsFor({ propertyType: 'terracedHouse' })).toEqual([
      ['propertyDetails.rows.propertyType', 'propertyDetails.propertyType.terracedHouse'],
    ]);
    expect(rowsFor({ propertyType: 'castle' })).toEqual([]);
  });

  it('does not show floor plan files when the tenant has no floor plan', () => {
    expect(
      rowsFor({
        propertyFloorPlanAvailable: 'No',
        floorPlanManualDetails: 'Open plan',
        floorPlanDocuments: [file('old.pdf')],
      })
    ).toEqual([['propertyDetails.rows.propertyFloorPlanAvailable', 'common:no']]);
  });

  it('does not show details the tenant left behind after answering No', () => {
    expect(
      rowsFor({
        otherFacilitiesAvailable: 'No',
        otherFacilitiesDetails: 'old',
        sharePropertyWithLandlord: 'No',
        sharePropertyWithLandlordDetails: 'old',
        furnitureProvidedInTenancy: 'No',
        furnitureProvidedInTenancyDetails: 'old',
        additionalServicesProvidedInTenancy: 'No',
        additionalServicesProvidedInTenancyDetails: 'old',
      })
    ).toEqual([
      ['propertyDetails.rows.otherFacilitiesAvailable', 'common:no'],
      ['propertyDetails.rows.sharePropertyWithLandlord', 'common:no'],
      ['propertyDetails.rows.furnitureProvidedInTenancy', 'common:no'],
      ['propertyDetails.rows.additionalServicesProvidedInTenancy', 'common:no'],
    ]);
  });

  it('shows the other facilities for a Yes in any casing, and Yes if they are missing', () => {
    expect(rowsFor({ otherFacilitiesAvailable: 'YES', otherFacilitiesDetails: 'A shed' })).toEqual([
      ['propertyDetails.rows.otherFacilitiesAvailable', 'A shed'],
    ]);
    expect(rowsFor({ otherFacilitiesAvailable: 'Yes', otherFacilitiesDetails: ' ' })).toEqual([
      ['propertyDetails.rows.otherFacilitiesAvailable', 'common:yes'],
    ]);
  });

  it('shows only the answer for sharing with the landlord and services, as the design does', () => {
    expect(
      rowsFor({
        sharePropertyWithLandlord: 'Yes',
        sharePropertyWithLandlordDetails: 'Kitchen',
        additionalServicesProvidedInTenancy: 'Yes',
        additionalServicesProvidedInTenancyDetails: 'Cleaning',
      })
    ).toEqual([
      ['propertyDetails.rows.sharePropertyWithLandlord', 'common:yes'],
      ['propertyDetails.rows.additionalServicesProvidedInTenancy', 'common:yes'],
    ]);
  });

  it('escapes file names', () => {
    expect(rowsFor({ outsidePropertyDocuments: [file('<x>.png'), { url: 'http://dm-store/no-name' }] })).toEqual([
      ['propertyDetails.rows.outsidePropertyDocuments', '&lt;x&gt;.png'],
    ]);
  });

  it('shows nothing when the tenant has not given property details', () => {
    expect(rowsFor()).toEqual([]);
    expect(rowsFor({})).toEqual([]);
  });

  it('does not use saved data from a different case', () => {
    expect(rowsFor(fullAnswers, '9999888877776666')).toEqual([]);
  });
});
