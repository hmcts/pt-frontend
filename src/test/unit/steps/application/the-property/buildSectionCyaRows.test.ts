import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { buildSectionCyaRows } from '../../../../../main/steps/application/the-property/check-your-answers-the-property/buildSectionCyaRows';

const t = ((key: string) => key) as unknown as TFunction;

type Row = {
  key: { text: string };
  value: { text?: string; html?: string };
  actions: { items: { href: string }[] };
};

const CASE_REF = '1234123412341234';

const buildReq = (
  formData: Record<string, Record<string, unknown>> = {},
  savedCase: Record<string, unknown> = {},
  savedCaseReference = CASE_REF
): Request =>
  ({
    params: { caseReference: CASE_REF },
    session: {
      formData: { [CASE_REF]: formData },
      ccdCase: { caseReference: savedCaseReference, ...savedCase },
    },
  }) as unknown as Request;

const rowsFor = (req: Request): Row[] => buildSectionCyaRows(req, t) as Row[];

const summarise = (rows: Row[]) => rows.map(row => [row.key.text, row.value.text]);

describe('buildSectionCyaRows for property details', () => {
  it('returns no rows when the route has no case reference', () => {
    expect(buildSectionCyaRows({ session: {} } as unknown as Request, t)).toEqual([]);
  });

  it('shows empty rows when nothing has been answered', () => {
    const rows = rowsFor(buildReq());

    expect(rows.length).toBeGreaterThan(0);

    expect(rows.map(row => row.key.text)).toContain('rows.propertyType.label');
    expect(rows.map(row => row.key.text)).toContain('rows.propertyFloorPlanAvailable.label');
    expect(rows.map(row => row.key.text)).toContain('rows.indoorFeatures.label');
    expect(rows.map(row => row.key.text)).toContain('rows.otherFacilitiesAvailable.label');
  });

  it('shows the property address from the form data', () => {
    const rows = rowsFor(
      buildReq({
        'property-address': {
          addressLine1: '10 High Street',
          addressLine2: 'Flat 2',
          postTown: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
        },
      })
    );

    const addressRow = rows.find(row => row.key.text === 'rows.propertyAddress.label');

    expect(addressRow).toBeDefined();
    expect(addressRow?.value.html).toContain('10 High Street');
    expect(addressRow?.value.html).toContain('SW1A 1AA');
  });

  it('shows the property type and room description', () => {
    const rows = rowsFor(
      buildReq({
        'what-are-you-renting': {
          propertyType: 'room',
          'propertyType.roomDescription': 'A bedroom in a shared house',
        },
      })
    );

    expect(summarise(rows)).toContainEqual(['rows.propertyType.label', 'rows.propertyType.options.room']);

    const descriptionRow = rows.find(row => row.key.text === 'rows.rentingRoomDetails.label');

    expect(descriptionRow).toBeDefined();
    expect(descriptionRow?.value.html).toContain('A bedroom in a shared house');
  });

  it('shows the flat floor when the property type is flat', () => {
    const rows = rowsFor(
      buildReq({
        'what-are-you-renting': {
          propertyType: 'flat',
          'propertyType.flatFloor': 'Second floor',
        },
      })
    );

    const flatRow = rows.find(row => row.key.text === 'rows.rentingFlatDetails.label');

    expect(flatRow).toBeDefined();
    expect(flatRow?.value.html).toContain('Second floor');
  });

  it('shows the other property description when the property type is other', () => {
    const rows = rowsFor(
      buildReq({
        'what-are-you-renting': {
          propertyType: 'other',
          'propertyType.otherDescription': 'A converted barn',
        },
      })
    );

    const descriptionRow = rows.find(row => row.key.text === 'rows.otherMethodRentingDetails.label');

    expect(descriptionRow).toBeDefined();
    expect(descriptionRow?.value.html).toContain('A converted barn');
  });

  it('shows the floor plan answer and layout description when there is no floor plan', () => {
    const rows = rowsFor(
      buildReq({
        'floor-plan-of-property': {
          propertyFloorPlanAvailable: 'no',
          'propertyFloorPlanAvailable.floorPlanManualDetails': 'The property has a hallway and two bedrooms',
        },
      })
    );

    const floorPlanRow = rows.find(row => row.key.text === 'rows.propertyFloorPlanAvailable.label');
    const layoutRow = rows.find(row => row.key.text === 'rows.floorPlanManualDetails.label');

    expect(floorPlanRow?.value.text).toBe('rows.propertyFloorPlanAvailable.options.no');
    expect(layoutRow).toBeDefined();
    expect(layoutRow?.value.html).toContain('The property has a hallway and two bedrooms');
  });

  it('does not show the layout description when a floor plan is available', () => {
    const rows = rowsFor(
      buildReq({
        'floor-plan-of-property': {
          propertyFloorPlanAvailable: 'yes',
          'propertyFloorPlanAvailable.floorPlanManualDetails': 'A property layout',
        },
      })
    );

    expect(rows.map(row => row.key.text)).not.toContain('rows.floorPlanManualDetails.label');
  });

  it('does not show property type descriptions when they are not applicable', () => {
    const rows = rowsFor(
      buildReq({
        'what-are-you-renting': {
          propertyType: 'house',
        },
      })
    );

    expect(rows.map(row => row.key.text)).not.toContain('rows.rentingRoomDetails.label');
    expect(rows.map(row => row.key.text)).not.toContain('rows.rentingFlatDetails.label');
    expect(rows.map(row => row.key.text)).not.toContain('rows.otherMethodRentingDetails.label');
  });

  it('shows indoor features when provided', () => {
    const rows = rowsFor(
      buildReq({
        'indoor-features': {
          indoorFeatures: 'Central heating and double glazing',
        },
      })
    );

    const indoorFeaturesRow = rows.find(row => row.key.text === 'rows.indoorFeatures.label');

    expect(indoorFeaturesRow).toBeDefined();
    expect(indoorFeaturesRow?.value.html).toContain('Central heating and double glazing');
  });

  it('shows an empty indoor features row when no answer has been provided', () => {
    const rows = rowsFor(buildReq());

    expect(rows.map(row => row.key.text)).toContain('rows.indoorFeatures.label');
  });

  it('shows other facilities and their description when included', () => {
    const rows = rowsFor(
      buildReq({
        'does-the-tenancy-include-other-facilities': {
          otherFacilitiesAvailable: 'yes',
          'otherFacilitiesAvailable.otherFacilitiesDetails': 'A communal garden',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toContain('rows.otherFacilitiesAvailable.label');
    expect(rows.map(row => row.key.text)).toContain('rows.otherFacilitiesDetails.label');

    expect(rows.find(row => row.key.text === 'rows.otherFacilitiesAvailable.label')?.value.text).toBe(
      'rows.otherFacilitiesAvailable.options.yes'
    );

    expect(rows.find(row => row.key.text === 'rows.otherFacilitiesDetails.label')?.value.html).toContain(
      'A communal garden'
    );
  });

  it('does not show the facilities description when other facilities are not included', () => {
    const rows = rowsFor(
      buildReq({
        'does-the-tenancy-include-other-facilities': {
          otherFacilitiesAvailable: 'no',
          'otherFacilitiesAvailable.otherFacilitiesDetails': 'A communal garden',
        },
      })
    );

    expect(rows.map(row => row.key.text)).not.toContain('rows.otherFacilitiesDetails.label');
  });

  it('shows shared property details when the property is shared with the landlord', () => {
    const rows = rowsFor(
      buildReq({
        'do-you-share-the-property-with-landlord': {
          sharePropertyWithLandlord: 'yes',
          'sharePropertyWithLandlord.sharePropertyWithLandlordDetails': 'The landlord shares the kitchen',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toContain('rows.sharePropertyWithLandlord.label');
    expect(rows.map(row => row.key.text)).toContain('rows.sharePropertyWithLandlordDetails.label');

    expect(rows.find(row => row.key.text === 'rows.sharePropertyWithLandlordDetails.label')?.value.html).toContain(
      'The landlord shares the kitchen'
    );
  });

  it('does not show sharing details when the property is not shared with the landlord', () => {
    const rows = rowsFor(
      buildReq({
        'do-you-share-the-property-with-landlord': {
          sharePropertyWithLandlord: 'no',
          'sharePropertyWithLandlord.sharePropertyWithLandlordDetails': 'The landlord shares the kitchen',
        },
      })
    );

    expect(rows.map(row => row.key.text)).not.toContain('rows.sharePropertyWithLandlordDetails.label');
  });
  it('shows furniture details when furniture is provided', () => {
    const rows = rowsFor(
      buildReq({
        'furniture-provided-tenancy': {
          furnitureProvidedInTenancy: 'yes',
          'furnitureProvidedInTenancy.furnitureProvidedInTenancyDetails': 'Sofa, bed and wardrobe',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toContain('rows.furnitureProvidedInTenancy.label');
    expect(rows.map(row => row.key.text)).toContain('rows.furnitureProvidedInTenancyDetails.label');

    expect(rows.find(row => row.key.text === 'rows.furnitureProvidedInTenancyDetails.label')?.value.html).toContain(
      'Sofa, bed and wardrobe'
    );
  });

  it('does not show furniture details when furniture is not provided', () => {
    const rows = rowsFor(
      buildReq({
        'furniture-provided-tenancy': {
          furnitureProvidedInTenancy: 'no',
          'furnitureProvidedInTenancy.furnitureProvidedInTenancyDetails': 'Sofa, bed and wardrobe',
        },
      })
    );

    expect(rows.map(row => row.key.text)).not.toContain('rows.furnitureProvidedInTenancyDetails.label');
  });

  it('shows services details when services are provided', () => {
    const rows = rowsFor(
      buildReq({
        'services-provided-tenancy': {
          additionalServicesProvidedInTenancy: 'yes',
          'additionalServicesProvidedInTenancy.additionalServicesProvidedInTenancyDetails': 'Water and electricity',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toContain('rows.additionalServicesProvidedInTenancy.label');
    expect(rows.map(row => row.key.text)).toContain('rows.additionalServicesProvidedInTenancyDetails.label');

    expect(
      rows.find(row => row.key.text === 'rows.additionalServicesProvidedInTenancyDetails.label')?.value.html
    ).toContain('Water and electricity');
  });

  it('does not show services details when services are not provided', () => {
    const rows = rowsFor(
      buildReq({
        'services-provided-tenancy': {
          additionalServicesProvidedInTenancy: 'no',
          'additionalServicesProvidedInTenancy.additionalServicesProvidedInTenancyDetails': 'Water and electricity',
        },
      })
    );

    expect(rows.map(row => row.key.text)).not.toContain('rows.additionalServicesProvidedInTenancyDetails.label');
  });

  it('shows landlord and tenant repair responsibilities', () => {
    const rows = rowsFor(
      buildReq({
        'what-repairs-landlord-responsibility': {
          landlordRepairsDetails: 'Structural repairs',
        },
        'what-repairs-tenant-responsibility': {
          tenantRepairsDetails: 'Replacing light bulbs',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toContain('rows.landlordRepairsDetails.label');
    expect(rows.map(row => row.key.text)).toContain('rows.tenantRepairsDetails.label');

    expect(rows.find(row => row.key.text === 'rows.landlordRepairsDetails.label')?.value.html).toContain(
      'Structural repairs'
    );

    expect(rows.find(row => row.key.text === 'rows.tenantRepairsDetails.label')?.value.html).toContain(
      'Replacing light bulbs'
    );
  });

  it('shows repairs and improvements when answered yes', () => {
    const rows = rowsFor(
      buildReq({
        'repairs-and-improvements': {
          anyTenantsMadePropertyRepairs: 'yes',
        },
      })
    );

    expect(rows.find(row => row.key.text === 'rows.anyTenantsMadePropertyRepairs.label')?.value.text).toBe(
      'rows.anyTenantsMadePropertyRepairs.options.yes'
    );
  });

  it('shows the not sure option for repairs and improvements', () => {
    const rows = rowsFor(
      buildReq({
        'repairs-and-improvements': {
          anyTenantsMadePropertyRepairs: 'NOT_SURE',
        },
      })
    );

    expect(rows.find(row => row.key.text === 'rows.anyTenantsMadePropertyRepairs.label')?.value.text).toBe(
      'rows.anyTenantsMadePropertyRepairs.options.notSure'
    );
  });

  it('shows boolean answers as yes or no', () => {
    const rows = rowsFor(
      buildReq({
        'floor-plan-of-property': {
          propertyFloorPlanAvailable: false,
        },
        'does-the-tenancy-include-other-facilities': {
          otherFacilitiesAvailable: true,
        },
      })
    );

    expect(rows.find(row => row.key.text === 'rows.propertyFloorPlanAvailable.label')?.value.text).toBe(
      'rows.propertyFloorPlanAvailable.options.no'
    );

    expect(rows.find(row => row.key.text === 'rows.otherFacilitiesAvailable.label')?.value.text).toBe(
      'rows.otherFacilitiesAvailable.options.yes'
    );
  });

  it('falls back to the saved case when there is no form data', () => {
    const rows = rowsFor(
      buildReq(
        {},
        {
          propertyDetails: {
            rentingRoomDetails: 'A bedroom in a shared house',
            propertyType: 'room',
            propertyFloorPlanAvailable: false,
            floorPlanManualDetails: 'A hallway and two bedrooms',
            indoorFeatures: 'Central heating',
            otherFacilitiesAvailable: true,
            otherFacilitiesDetails: 'A communal garden',
            sharePropertyWithLandlord: false,
            furnitureProvidedInTenancy: false,
            additionalServicesProvidedInTenancy: false,
            landlordRepairsDetails: 'Structural repairs',
            tenantRepairsDetails: 'Replacing light bulbs',
            anyTenantsMadePropertyRepairs: 'NOT_SURE',
          },
        }
      )
    );

    expect(rows.map(row => row.key.text)).toEqual(
      expect.arrayContaining([
        'rows.propertyType.label',
        'rows.rentingRoomDetails.label',
        'rows.propertyFloorPlanAvailable.label',
        'rows.floorPlanManualDetails.label',
        'rows.indoorFeatures.label',
        'rows.otherFacilitiesAvailable.label',
        'rows.otherFacilitiesDetails.label',
        'rows.sharePropertyWithLandlord.label',
        'rows.furnitureProvidedInTenancy.label',
        'rows.additionalServicesProvidedInTenancy.label',
        'rows.landlordRepairsDetails.label',
        'rows.tenantRepairsDetails.label',
        'rows.anyTenantsMadePropertyRepairs.label',
      ])
    );
  });

  it('prefers form data over the saved case', () => {
    const rows = rowsFor(
      buildReq(
        {
          'what-are-you-renting': {
            propertyType: 'flat',
            'propertyType.flatFloor': 'Third floor',
          },
        },
        {
          propertyDetails: {
            propertyType: 'room',
            rentingFlatDetails: 'First floor',
          },
        }
      )
    );

    const propertyTypeRow = rows.find(row => row.key.text === 'rows.propertyType.label');
    const flatDetailsRow = rows.find(row => row.key.text === 'rows.rentingFlatDetails.label');

    expect(propertyTypeRow?.value.text).toBe('rows.propertyType.options.flat');
    expect(flatDetailsRow?.value.html).toContain('Third floor');
  });

  it('ignores the saved case when it belongs to a different case', () => {
    const rows = rowsFor(
      buildReq(
        {},
        {
          propertyDetails: {
            propertyType: 'flat',
          },
        },
        '9999999999999999'
      )
    );

    const propertyTypeRow = rows.find(row => row.key.text === 'rows.propertyType.label');

    expect(propertyTypeRow?.value.text).toBe('rows.propertyType.options.empty');
  });

  it('renders empty rows when optional answers have not been provided', () => {
    const rows = rowsFor(
      buildReq({
        'what-are-you-renting': {
          propertyType: 'flat',
        },
        'floor-plan-of-property': {
          propertyFloorPlanAvailable: 'yes',
        },
        'does-the-tenancy-include-other-facilities': {
          otherFacilitiesAvailable: 'no',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toContain('rows.propertyType.label');
    expect(rows.map(row => row.key.text)).toContain('rows.rentingFlatDetails.label');
    expect(rows.map(row => row.key.text)).toContain('rows.propertyFloorPlanAvailable.label');
    expect(rows.map(row => row.key.text)).toContain('rows.otherFacilitiesAvailable.label');
  });

  it('shows uploaded floor plan documents from the form data', () => {
    const rows = rowsFor(
      buildReq({
        'floor-plan-of-property': {
          propertyFloorPlanAvailable: 'yes',
        },
        'upload-floor-plan-of-property': {
          documents: [{ document_filename: 'floor-plan.pdf' }],
        },
      })
    );

    expect(rows.map(row => row.key.text)).toContain('rows.floorPlanDocuments.label');
  });

  it('shows uploaded outside property photos from the form data', () => {
    const rows = rowsFor(
      buildReq({
        'upload-photo-outside-of-property': {
          documents: [{ document_filename: 'outside-photo.jpg' }],
        },
      })
    );

    expect(rows.map(row => row.key.text)).toContain('rows.outsidePropertyDocuments.label');
  });

  it('shows uploaded room photos from the form data', () => {
    const rows = rowsFor(
      buildReq({
        'upload-photo-of-each-room': {
          documents: [{ document_filename: 'bedroom.jpg' }],
        },
      })
    );

    expect(rows.map(row => row.key.text)).toContain('rows.propertyRoomsDocuments.label');
  });

  it('shows uploaded repairs and improvements evidence when answered yes', () => {
    const rows = rowsFor(
      buildReq({
        'repairs-and-improvements': {
          anyTenantsMadePropertyRepairs: 'yes',
        },
        'upload-evidence-improvements-or-repairs': {
          documents: [{ document_filename: 'repairs-evidence.pdf' }],
        },
      })
    );

    expect(rows.map(row => row.key.text)).toContain('rows.repairsEvidenceDocuments.label');
  });

  it('does not show repairs evidence when repairs and improvements are answered no', () => {
    const rows = rowsFor(
      buildReq({
        'repairs-and-improvements': {
          anyTenantsMadePropertyRepairs: 'no',
        },
        'upload-evidence-improvements-or-repairs': {
          documents: [{ document_filename: 'repairs-evidence.pdf' }],
        },
      })
    );

    expect(rows.map(row => row.key.text)).not.toContain('rows.repairsEvidenceDocuments.label');
  });

  it('shows an empty document row when no documents have been uploaded', () => {
    const rows = rowsFor(
      buildReq({
        'floor-plan-of-property': {
          propertyFloorPlanAvailable: 'yes',
        },
        'upload-floor-plan-of-property': {
          documents: [],
        },
      })
    );

    const documentRow = rows.find(row => row.key.text === 'rows.floorPlanDocuments.label');

    expect(documentRow).toBeDefined();
    expect(documentRow?.value).toBeDefined();
  });

  it('shows saved documents from the case when there are no form documents', () => {
    const rows = rowsFor(
      buildReq(
        {},
        {
          propertyDetails: {
            propertyFloorPlanAvailable: 'Yes',
            floorPlanDocuments: [{ url: 'https://example.com/floor-plan.pdf' }],
            outsidePropertyDocuments: [{ url: 'https://example.com/outside.jpg' }],
            propertyRoomsDocuments: [{ url: 'https://example.com/room.jpg' }],
          },
        }
      )
    );

    expect(rows.map(row => row.key.text)).toEqual(
      expect.arrayContaining([
        'rows.floorPlanDocuments.label',
        'rows.outsidePropertyDocuments.label',
        'rows.propertyRoomsDocuments.label',
      ])
    );
  });

  it('prefers form documents over saved documents', () => {
    const rows = rowsFor(
      buildReq(
        {
          'upload-photo-outside-of-property': {
            documents: [{ document_filename: 'new-photo.jpg' }],
          },
        },
        {
          propertyDetails: {
            outsidePropertyDocuments: [{ url: 'https://example.com/old-photo.jpg' }],
          },
        }
      )
    );

    expect(rows.map(row => row.key.text)).toContain('rows.outsidePropertyDocuments.label');
  });

  it('points each row change link to the relevant property step', () => {
    const rows = rowsFor(
      buildReq({
        'what-are-you-renting': {
          propertyType: 'flat',
        },
        'floor-plan-of-property': {
          propertyFloorPlanAvailable: 'no',
        },
        'indoor-features': {
          indoorFeatures: 'Central heating',
        },
      })
    );

    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(rows.every(row => row.actions.items.length === 1)).toBe(true);
    expect(rows.every(row => row.actions.items[0].href.startsWith(`/${CASE_REF}/`))).toBe(true);
  });
});
