import type { PtCaseDocument } from '@services/ccdCase.interface';
import type { Request } from 'express';
import type { TFunction } from 'i18next';

import {
  SummaryListRow,
  createRowContext,
  escapeWithLineBreaks,
  isYes,
  multiSelectValue,
} from '../../section-cya/cyaRow';
import { ApplicationSectionId } from '../../sections.config';

import { type DisplayDocument } from '@modules/documents/storage';
import { getFormData } from '@modules/steps';

const SECTION_ID: ApplicationSectionId = 'propertyDetails';

const caseFieldNames: Record<string, string> = {
  roomOrRoomsDescription: 'propertyTypeRoomDescription',
  flatFloor: 'propertyTypeFlatFloor',
  otherDescription: 'propertyTypeOtherDescription',
};

export function buildSectionCyaRows(req: Request, t: TFunction): SummaryListRow[] {
  const ctx = createRowContext(req, SECTION_ID, t);
  if (!ctx) {
    return [];
  }

  const { rows, validatedCase, change } = ctx;
  const stepData = (step: string): Record<string, unknown> => getFormData(req, step);

  const propertyDetails = validatedCase?.propertyDetails;

  const asAnswer = (value: unknown): string | undefined => {
    if (typeof value === 'boolean') {
      return value ? 'yes' : 'no';
    }
    return typeof value === 'string' ? value : undefined;
  };

  const savedValue = (field: string): unknown => {
    const key = caseFieldNames[field] ?? field;
    const savedFields = propertyDetails as unknown as Record<string, unknown> | undefined;
    return savedFields?.[key];
  };

  const read = (step: string, field: string): string | undefined =>
    asAnswer(stepData(step)[field] ?? savedValue(field));

  const readSubField = (step: string, parent: string, field: string): string | undefined =>
    asAnswer(stepData(step)[`${parent}.${field}`] ?? savedValue(field));

  const pushChoiceRow = (step: string, field: string, answer?: string): void => {
    if (!answer) {
      return;
    }

    const upper = answer.trim().toUpperCase();
    const option =
      upper === 'NOT_SURE' || upper === 'NOTSURE'
        ? 'notSure'
        : upper === 'YES' || upper === 'NO'
          ? upper.toLowerCase()
          : answer.trim();

    rows.push({
      key: { text: t(`rows.${field}.label`) },
      value: { text: t(`rows.${field}.options.${option}`) },
      actions: { items: [change(step, `rows.${field}.changeHidden`)] },
    });
  };

  const pushTextRow = (step: string, field: string, value?: string): void => {
    if (!value?.trim()) {
      return;
    }

    rows.push({
      key: { text: t(`rows.${field}.label`) },
      value: { html: escapeWithLineBreaks(value) },
      actions: { items: [change(step, `rows.${field}.changeHidden`)] },
    });
  };

  const pushDocumentRow = (step: string, field: string, savedDocuments?: PtCaseDocument[]): void => {
    const documents = stepData(step).documents as DisplayDocument[] | undefined;

    const filenames = (
      documents !== undefined
        ? documents.map(doc => doc.document_filename)
        : (savedDocuments ?? []).map(doc => (doc.url ? t('rows.documentUploaded') : ''))
    ).filter((name): name is string => Boolean(name));

    if (!filenames.length) {
      return;
    }

    rows.push({
      key: { text: t(`rows.${field}.label`) },
      value: multiSelectValue(filenames, new Set(filenames)),
      actions: { items: [change(step, `rows.${field}.changeHidden`)] },
    });
  };

  const address = [
    read('property-address', 'addressLine1'),
    read('property-address', 'addressLine2'),
    read('property-address', 'townOrCity'),
    read('property-address', 'county'),
    read('property-address', 'postcode'),
  ].filter((part): part is string => Boolean(part?.trim()));

  if (address.length) {
    pushTextRow('property-address', 'propertyAddress', address.join('\n'));
  }

  const propertyType = read('what-are-you-renting', 'propertyType');

  // What Property are you renting
  if (propertyType) {
    pushChoiceRow('what-are-you-renting', 'propertyType', propertyType);

    if (propertyType === 'roomOrRooms') {
      const roomDescription = readSubField('what-are-you-renting', 'propertyType', 'roomOrRoomsDescription');
      pushTextRow('what-are-you-renting', 'propertyTypeRoomDescription', roomDescription);
    }

    if (propertyType === 'flat') {
      const flatFloor = readSubField('what-are-you-renting', 'propertyType', 'flatFloor');
      pushTextRow('what-are-you-renting', 'propertyTypeFlatFloor', flatFloor);
    }

    if (propertyType === 'other') {
      const otherDescription = readSubField('what-are-you-renting', 'propertyType', 'otherDescription');
      pushTextRow('what-are-you-renting', 'propertyTypeOtherDescription', otherDescription);
    }
  }

  // Floor plan
  const hasFloorPlan = read('floor-plan-of-property', 'hasFloorPlanOfProperty');

  if (hasFloorPlan) {
    pushChoiceRow('floor-plan-of-property', 'hasFloorPlanOfProperty', hasFloorPlan);

    if (hasFloorPlan.trim().toUpperCase() === 'NO') {
      const layoutDescription = readSubField(
        'floor-plan-of-property',
        'hasFloorPlanOfProperty',
        'propertyLayoutDescription'
      );
      pushTextRow('floor-plan-of-property', 'propertyLayoutDescription', layoutDescription);
    }
  }

  // Upload floor plan
  if (isYes(hasFloorPlan)) {
    pushDocumentRow('upload-floor-plan-of-property', 'floorPlanDocuments', propertyDetails?.floorPlanDocuments);
  }

  //Indoor features
  const indoorFeatures = read('indoor-features', 'indoorFeatures');
  pushTextRow('indoor-features', 'indoorFeatures', indoorFeatures);

  // Other Facilities
  const facilities = read('does-the-tenancy-include-other-facilities', 'propertyIncludesOtherFacilities');

  if (facilities) {
    pushChoiceRow('does-the-tenancy-include-other-facilities', 'propertyIncludesOtherFacilities', facilities);

    if (isYes(facilities)) {
      const facilitiesDescription = readSubField(
        'does-the-tenancy-include-other-facilities',
        'propertyIncludesOtherFacilities',
        'propertyFacilitiesDescription'
      );
      pushTextRow('does-the-tenancy-include-other-facilities', 'propertyFacilitiesDescription', facilitiesDescription);
    }
  }

  // Shared property with landlord
  const sharedWithLandlord = read('do-you-share-the-property-with-landlord', 'propertySharedWithLandlord');

  if (sharedWithLandlord) {
    pushChoiceRow('do-you-share-the-property-with-landlord', 'propertySharedWithLandlord', sharedWithLandlord);

    if (isYes(sharedWithLandlord)) {
      const sharingDetails = readSubField(
        'do-you-share-the-property-with-landlord',
        'propertySharedWithLandlord',
        'propertySharedWithLandlordDetails'
      );
      pushTextRow('do-you-share-the-property-with-landlord', 'propertySharedWithLandlordDetails', sharingDetails);
    }
  }

  // Outside photos
  pushDocumentRow(
    'upload-photo-outside-of-property',
    'outsidePropertyDocuments',
    propertyDetails?.outsidePropertyDocuments
  );

  // Room photos
  pushDocumentRow('upload-photo-of-each-room', 'propertyRoomsDocuments', propertyDetails?.propertyRoomsDocuments);

  // Furniture provided
  const furnitureProvided = read('furniture-provided-tenancy', 'furnitureProvided');

  if (furnitureProvided) {
    pushChoiceRow('furniture-provided-tenancy', 'furnitureProvided', furnitureProvided);

    if (isYes(furnitureProvided)) {
      const furnitureDetails = readSubField(
        'furniture-provided-tenancy',
        'furnitureProvided',
        'furnitureProvidedDetails'
      );
      pushTextRow('furniture-provided-tenancy', 'furnitureProvidedDetails', furnitureDetails);
    }
  }

  // Services provided
  const servicesProvided = read('services-provided-tenancy', 'servicesProvided');

  if (servicesProvided) {
    pushChoiceRow('services-provided-tenancy', 'servicesProvided', servicesProvided);

    if (isYes(servicesProvided)) {
      const servicesDetails = readSubField('services-provided-tenancy', 'servicesProvided', 'servicesProvidedDetails');
      pushTextRow('services-provided-tenancy', 'servicesProvidedDetails', servicesDetails);
    }
  }

  // Repairs the landlord is responsible for
  const landlordRepairs = read('what-repairs-landlord-responsibility', 'landlordRepairsDetails');
  pushTextRow('what-repairs-landlord-responsibility', 'landlordRepairsDetails', landlordRepairs);

  // Repairs the tenant is responsible for
  const tenantRepairs = read('what-repairs-tenant-responsibility', 'tenantRepairsDetails');
  pushTextRow('what-repairs-tenant-responsibility', 'tenantRepairsDetails', tenantRepairs);

  // Repairs and improvements
  const repairsAndImprovements = read('repairs-and-improvements', 'hasRepairsAndImprovements');

  if (repairsAndImprovements) {
    pushChoiceRow('repairs-and-improvements', 'hasRepairsAndImprovements', repairsAndImprovements);
  }

  // Upload - repairs and improvements
  if (isYes(repairsAndImprovements)) {
    pushDocumentRow(
      'upload-evidence-improvements-or-repairs',
      'repairsEvidenceDocuments',
      propertyDetails?.repairsEvidenceDocuments
    );
  }

  return rows;
}
