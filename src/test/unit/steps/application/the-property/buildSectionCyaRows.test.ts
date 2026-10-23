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

  it('returns no rows when nothing has been answered', () => {
    expect(rowsFor(buildReq())).toEqual([]);
  });

  it('shows the property address from the form data', () => {
    const rows = rowsFor(
      buildReq({
        'property-address': {
          addressLine1: '10 High Street',
          addressLine2: 'Flat 2',
          townOrCity: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
        },
      })
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].key.text).toBe('rows.propertyAddress.label');
    expect(rows[0].value.html).toContain('10 High Street');
    expect(rows[0].value.html).toContain('SW1A 1AA');
  });

  it('shows the property type and room description', () => {
    const rows = rowsFor(
      buildReq({
        'what-are-you-renting': {
          propertyType: 'roomOrRooms',
          'propertyType.roomOrRoomsDescription': 'A bedroom in a shared house',
        },
      })
    );

    expect(summarise(rows)).toEqual([
      ['rows.propertyType.label', 'rows.propertyType.options.roomorrooms'],
      ['rows.propertyTypeRoomDescription.label', undefined],
    ]);

    expect(rows[1].value.html).toContain('A bedroom in a shared house');
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

    expect(rows.map(row => row.key.text)).toEqual(['rows.propertyType.label', 'rows.propertyTypeFlatFloor.label']);

    expect(rows[1].value.html).toContain('Second floor');
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

    expect(rows.map(row => row.key.text)).toEqual([
      'rows.propertyType.label',
      'rows.propertyTypeOtherDescription.label',
    ]);

    expect(rows[1].value.html).toContain('A converted barn');
  });

  it('does not show property type descriptions when they are not applicable', () => {
    const rows = rowsFor(
      buildReq({
        'what-are-you-renting': {
          propertyType: 'house',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual(['rows.propertyType.label']);
  });

  it('shows the floor plan answer and layout description when there is no floor plan', () => {
    const rows = rowsFor(
      buildReq({
        'floor-plan-of-property': {
          hasFloorPlanOfProperty: 'no',
          'hasFloorPlanOfProperty.propertyLayoutDescription': 'The property has a hallway and two bedrooms',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual([
      'rows.hasFloorPlanOfProperty.label',
      'rows.propertyLayoutDescription.label',
    ]);

    expect(rows[0].value.text).toBe('rows.hasFloorPlanOfProperty.options.no');
    expect(rows[1].value.html).toContain('The property has a hallway and two bedrooms');
  });

  it('does not show the layout description when a floor plan is available', () => {
    const rows = rowsFor(
      buildReq({
        'floor-plan-of-property': {
          hasFloorPlanOfProperty: 'yes',
          'hasFloorPlanOfProperty.propertyLayoutDescription': 'A property layout',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual(['rows.hasFloorPlanOfProperty.label']);
  });

  it('shows indoor features when provided', () => {
    const rows = rowsFor(
      buildReq({
        'indoor-features': {
          indoorFeatures: 'Central heating and double glazing',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual(['rows.indoorFeatures.label']);
    expect(rows[0].value.html).toContain('Central heating and double glazing');
  });

  it('shows other facilities and their description when included', () => {
    const rows = rowsFor(
      buildReq({
        'does-the-tenancy-include-other-facilities': {
          propertyIncludesOtherFacilities: 'yes',
          'propertyIncludesOtherFacilities.propertyFacilitiesDescription': 'A communal garden',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual([
      'rows.propertyIncludesOtherFacilities.label',
      'rows.propertyFacilitiesDescription.label',
    ]);

    expect(rows[0].value.text).toBe('rows.propertyIncludesOtherFacilities.options.yes');
    expect(rows[1].value.html).toContain('A communal garden');
  });

  it('does not show the facilities description when other facilities are not included', () => {
    const rows = rowsFor(
      buildReq({
        'does-the-tenancy-include-other-facilities': {
          propertyIncludesOtherFacilities: 'no',
          'propertyIncludesOtherFacilities.propertyFacilitiesDescription': 'A communal garden',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual(['rows.propertyIncludesOtherFacilities.label']);
  });

  it('shows shared property details when the property is shared with the landlord', () => {
    const rows = rowsFor(
      buildReq({
        'do-you-share-the-property-with-landlord': {
          propertySharedWithLandlord: 'yes',
          'propertySharedWithLandlord.propertySharedWithLandlordDetails': 'The landlord shares the kitchen',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual([
      'rows.propertySharedWithLandlord.label',
      'rows.propertySharedWithLandlordDetails.label',
    ]);

    expect(rows[1].value.html).toContain('The landlord shares the kitchen');
  });

  it('does not show sharing details when the property is not shared with the landlord', () => {
    const rows = rowsFor(
      buildReq({
        'do-you-share-the-property-with-landlord': {
          propertySharedWithLandlord: 'no',
          'propertySharedWithLandlord.propertySharedWithLandlordDetails': 'The landlord shares the kitchen',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual(['rows.propertySharedWithLandlord.label']);
  });

  it('shows furniture details when furniture is provided', () => {
    const rows = rowsFor(
      buildReq({
        'furniture-provided-tenancy': {
          furnitureProvided: 'yes',
          'furnitureProvided.furnitureProvidedDetails': 'Sofa, bed and wardrobe',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual([
      'rows.furnitureProvided.label',
      'rows.furnitureProvidedDetails.label',
    ]);

    expect(rows[1].value.html).toContain('Sofa, bed and wardrobe');
  });

  it('does not show furniture details when furniture is not provided', () => {
    const rows = rowsFor(
      buildReq({
        'furniture-provided-tenancy': {
          furnitureProvided: 'no',
          'furnitureProvided.furnitureProvidedDetails': 'Sofa, bed and wardrobe',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual(['rows.furnitureProvided.label']);
  });

  it('shows services details when services are provided', () => {
    const rows = rowsFor(
      buildReq({
        'services-provided-tenancy': {
          servicesProvided: 'yes',
          'servicesProvided.servicesProvidedDetails': 'Water and electricity',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual([
      'rows.servicesProvided.label',
      'rows.servicesProvidedDetails.label',
    ]);

    expect(rows[1].value.html).toContain('Water and electricity');
  });

  it('does not show services details when services are not provided', () => {
    const rows = rowsFor(
      buildReq({
        'services-provided-tenancy': {
          servicesProvided: 'no',
          'servicesProvided.servicesProvidedDetails': 'Water and electricity',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual(['rows.servicesProvided.label']);
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

    expect(rows.map(row => row.key.text)).toEqual([
      'rows.landlordRepairsDetails.label',
      'rows.tenantRepairsDetails.label',
    ]);

    expect(rows[0].value.html).toContain('Structural repairs');
    expect(rows[1].value.html).toContain('Replacing light bulbs');
  });

  it('shows repairs and improvements when answered yes', () => {
    const rows = rowsFor(
      buildReq({
        'repairs-and-improvements': {
          hasRepairsAndImprovements: 'yes',
        },
      })
    );

    expect(summarise(rows)).toEqual([
      ['rows.hasRepairsAndImprovements.label', 'rows.hasRepairsAndImprovements.options.yes'],
    ]);
  });

  it('shows the not sure option for repairs and improvements', () => {
    const rows = rowsFor(
      buildReq({
        'repairs-and-improvements': {
          hasRepairsAndImprovements: 'NOT_SURE',
        },
      })
    );

    expect(summarise(rows)).toEqual([
      ['rows.hasRepairsAndImprovements.label', 'rows.hasRepairsAndImprovements.options.notSure'],
    ]);
  });

  it('shows boolean answers as yes or no', () => {
    const rows = rowsFor(
      buildReq({
        'floor-plan-of-property': {
          hasFloorPlanOfProperty: false,
        },
        'does-the-tenancy-include-other-facilities': {
          propertyIncludesOtherFacilities: true,
        },
      })
    );

    expect(summarise(rows)).toEqual([
      ['rows.hasFloorPlanOfProperty.label', 'rows.hasFloorPlanOfProperty.options.no'],
      ['rows.propertyIncludesOtherFacilities.label', 'rows.propertyIncludesOtherFacilities.options.yes'],
    ]);
  });

  it('falls back to the saved case when there is no form data', () => {
    const rows = rowsFor(
      buildReq(
        {},
        {
          propertyDetails: {
            propertyTypeRoomDescription: 'A bedroom in a shared house',
            propertyType: 'roomOrRooms',
            hasFloorPlanOfProperty: false,
            propertyLayoutDescription: 'A hallway and two bedrooms',
            indoorFeatures: 'Central heating',
            propertyIncludesOtherFacilities: true,
            propertyFacilitiesDescription: 'A communal garden',
            propertySharedWithLandlord: false,
            furnitureProvided: false,
            servicesProvided: false,
            landlordRepairsDetails: 'Structural repairs',
            tenantRepairsDetails: 'Replacing light bulbs',
            hasRepairsAndImprovements: 'NOT_SURE',
          },
        }
      )
    );

    expect(rows.map(row => row.key.text)).toEqual(
      expect.arrayContaining([
        'rows.propertyType.label',
        'rows.propertyTypeRoomDescription.label',
        'rows.hasFloorPlanOfProperty.label',
        'rows.propertyLayoutDescription.label',
        'rows.indoorFeatures.label',
        'rows.propertyIncludesOtherFacilities.label',
        'rows.propertyFacilitiesDescription.label',
        'rows.propertySharedWithLandlord.label',
        'rows.furnitureProvided.label',
        'rows.servicesProvided.label',
        'rows.landlordRepairsDetails.label',
        'rows.tenantRepairsDetails.label',
        'rows.hasRepairsAndImprovements.label',
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
            propertyType: 'roomOrRooms',
            propertyTypeFlatFloor: 'First floor',
          },
        }
      )
    );

    expect(summarise(rows)).toEqual([
      ['rows.propertyType.label', 'rows.propertyType.options.flat'],
      ['rows.propertyTypeFlatFloor.label', undefined],
    ]);

    expect(rows[1].value.html).toContain('Third floor');
  });

  it('ignores the saved case when it belongs to a different case', () => {
    expect(
      rowsFor(
        buildReq(
          {},
          {
            propertyDetails: {
              propertyType: 'flat',
            },
          },
          '9999999999999999'
        )
      )
    ).toEqual([]);
  });

  it('leaves out optional answers the citizen did not give', () => {
    const rows = rowsFor(
      buildReq({
        'what-are-you-renting': {
          propertyType: 'flat',
        },
        'floor-plan-of-property': {
          hasFloorPlanOfProperty: 'yes',
        },
        'does-the-tenancy-include-other-facilities': {
          propertyIncludesOtherFacilities: 'no',
        },
      })
    );

    expect(rows.map(row => row.key.text)).toEqual([
      'rows.propertyType.label',
      'rows.hasFloorPlanOfProperty.label',
      'rows.propertyIncludesOtherFacilities.label',
    ]);
  });

  it('shows uploaded floor plan documents from the form data', () => {
    const rows = rowsFor(
      buildReq({
        'floor-plan-of-property': {
          hasFloorPlanOfProperty: 'yes',
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
          hasRepairsAndImprovements: 'yes',
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
          hasRepairsAndImprovements: 'no',
        },
        'upload-evidence-improvements-or-repairs': {
          documents: [{ document_filename: 'repairs-evidence.pdf' }],
        },
      })
    );

    expect(rows.map(row => row.key.text)).not.toContain('rows.repairsEvidenceDocuments.label');
  });

  it('does not show document rows when no documents have been uploaded', () => {
    const rows = rowsFor(
      buildReq({
        'floor-plan-of-property': {
          hasFloorPlanOfProperty: 'yes',
        },
        'upload-floor-plan-of-property': {
          documents: [],
        },
      })
    );

    expect(rows.map(row => row.key.text)).not.toContain('rows.floorPlanDocuments.label');
  });

  it('shows saved documents from the case when there are no form documents', () => {
    const rows = rowsFor(
      buildReq(
        {},
        {
          propertyDetails: {
            hasFloorPlanOfProperty: 'Yes',
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
          hasFloorPlanOfProperty: 'no',
        },
        'indoor-features': {
          indoorFeatures: 'Central heating',
        },
      })
    );

    expect(rows).toHaveLength(3);
    expect(rows.every(row => row.actions.items.length === 1)).toBe(true);
    expect(rows.every(row => row.actions.items[0].href.startsWith(`/${CASE_REF}/`))).toBe(true);
  });
});
