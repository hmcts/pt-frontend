import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { SummaryListRow, createRowContext, escapeWithLineBreaks, isYes } from '../../section-cya/cyaRow';
import { ApplicationSectionId } from '../../sections.config';

import { type DisplayDocument } from '@modules/documents/storage';
import { getFormData } from '@modules/steps';
import { PtCaseDocument } from '@services/ccd/ccdCase.interface';

const SECTION_ID: ApplicationSectionId = 'propertyDetails';

const caseFieldNames: Record<string, string> = {
  roomDescription: 'rentingRoomDetails',
  flatFloor: 'rentingFlatDetails',
  otherDescription: 'otherMethodRentingDetails',
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
    if (answer === undefined) {
      answer = 'empty';
    }

    const trimmed = answer.trim();
    const upper = trimmed.toUpperCase();

    const normalizedAnswer =
      {
        YES: 'yes',
        NO: 'no',
        NOT_SURE: 'notSure',
        NOTSURE: 'notSure',
      }[upper] ?? trimmed;

    rows.push({
      key: { text: t(`rows.${field}.label`) },
      value: { text: t(`rows.${field}.options.${normalizedAnswer}`) },
      actions: { items: [change(step, `rows.${field}.changeHidden`)] },
    });
  };

  const pushTextRow = (step: string, field: string, hideIfEmpty: boolean, value?: string): void => {
    if (hideIfEmpty && !value) {
      return;
    }

    rows.push({
      key: { text: t(`rows.${field}.label`) },
      value: { html: !value?.trim() ? t(`rows.${field}.empty`) : escapeWithLineBreaks(value) },
      actions: { items: [change(step, `rows.${field}.changeHidden`)] },
    });
  };

  const pushDocumentRow = (step: string, field: string, savedDocuments?: PtCaseDocument[]): void => {
    const stepDocuments = stepData(step).documents as DisplayDocument[] | undefined;
    const filenames = (
      stepDocuments?.map(document => document.document_filename) ??
      savedDocuments?.map(document => document.filename) ??
      []
    ).filter((filename): filename is string => Boolean(filename));

    if (filenames.length > 0) {
      rows.push({
        key: { text: t(`rows.${field}.label`) },
        value: { html: filenames.map(filename => escapeWithLineBreaks(filename)).join('<br>') },
        actions: { items: [change(step, `rows.${field}.changeHidden`)] },
      });
    }
  };

  const address = [
    read('property-address', 'addressLine1'),
    read('property-address', 'addressLine2'),
    read('property-address', 'postTown'),
    read('property-address', 'county'),
    read('property-address', 'postcode'),
  ].filter((part): part is string => Boolean(part?.trim()));

  if (address.length) {
    pushTextRow('property-address', 'propertyAddress', false, address.join('\n'));
  }

  const propertyType = read('what-are-you-renting', 'propertyType');

  // What Property are you renting
  pushChoiceRow('what-are-you-renting', 'propertyType', propertyType);

  if (propertyType === 'room') {
    const roomDescription = readSubField('what-are-you-renting', 'propertyType', 'roomDescription');
    pushTextRow('what-are-you-renting', 'rentingRoomDetails', true, roomDescription);
  }

  if (propertyType === 'flat') {
    const flatFloor = readSubField('what-are-you-renting', 'propertyType', 'flatFloor');
    pushTextRow('what-are-you-renting', 'rentingFlatDetails', true, flatFloor);
  }

  if (propertyType === 'other') {
    const otherDescription = readSubField('what-are-you-renting', 'propertyType', 'otherDescription');
    pushTextRow('what-are-you-renting', 'otherMethodRentingDetails', false, otherDescription);
  }

  // Floor plan
  const hasFloorPlan = read('floor-plan-of-property', 'propertyFloorPlanAvailable');

  pushChoiceRow('floor-plan-of-property', 'propertyFloorPlanAvailable', hasFloorPlan);

  if (hasFloorPlan?.trim().toUpperCase() === 'NO') {
    const layoutDescription = readSubField(
      'floor-plan-of-property',
      'propertyFloorPlanAvailable',
      'floorPlanManualDetails'
    );
    pushTextRow('floor-plan-of-property', 'floorPlanManualDetails', false, layoutDescription);
  }

  // Upload floor plan
  if (isYes(hasFloorPlan)) {
    pushDocumentRow('upload-floor-plan-of-property', 'floorPlanDocuments', propertyDetails?.floorPlanDocuments);
  }

  //Indoor features
  const indoorFeatures = read('indoor-features', 'indoorFeatures');
  pushTextRow('indoor-features', 'indoorFeatures', true, indoorFeatures);

  // Other Facilities
  const facilities = read('does-the-tenancy-include-other-facilities', 'otherFacilitiesAvailable');

  pushChoiceRow('does-the-tenancy-include-other-facilities', 'otherFacilitiesAvailable', facilities);

  if (isYes(facilities)) {
    const facilitiesDescription = readSubField(
      'does-the-tenancy-include-other-facilities',
      'otherFacilitiesAvailable',
      'otherFacilitiesDetails'
    );
    pushTextRow('does-the-tenancy-include-other-facilities', 'otherFacilitiesDetails', false, facilitiesDescription);
  }

  // Shared property with landlord
  const sharedWithLandlord = read('do-you-share-the-property-with-landlord', 'sharePropertyWithLandlord');

  pushChoiceRow('do-you-share-the-property-with-landlord', 'sharePropertyWithLandlord', sharedWithLandlord);

  if (isYes(sharedWithLandlord)) {
    const sharingDetails = readSubField(
      'do-you-share-the-property-with-landlord',
      'sharePropertyWithLandlord',
      'sharePropertyWithLandlordDetails'
    );
    pushTextRow('do-you-share-the-property-with-landlord', 'sharePropertyWithLandlordDetails', false, sharingDetails);
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
  const furnitureProvidedInTenancy = read('furniture-provided-tenancy', 'furnitureProvidedInTenancy');

  pushChoiceRow('furniture-provided-tenancy', 'furnitureProvidedInTenancy', furnitureProvidedInTenancy);

  if (isYes(furnitureProvidedInTenancy)) {
    const furnitureDetails = readSubField(
      'furniture-provided-tenancy',
      'furnitureProvidedInTenancy',
      'furnitureProvidedInTenancyDetails'
    );
    pushTextRow('furniture-provided-tenancy', 'furnitureProvidedInTenancyDetails', false, furnitureDetails);
  }

  // Services provided
  const additionalServicesProvidedInTenancy = read('services-provided-tenancy', 'additionalServicesProvidedInTenancy');

  pushChoiceRow(
    'services-provided-tenancy',
    'additionalServicesProvidedInTenancy',
    additionalServicesProvidedInTenancy
  );

  if (isYes(additionalServicesProvidedInTenancy)) {
    const servicesDetails = readSubField(
      'services-provided-tenancy',
      'additionalServicesProvidedInTenancy',
      'additionalServicesProvidedInTenancyDetails'
    );
    pushTextRow('services-provided-tenancy', 'additionalServicesProvidedInTenancyDetails', false, servicesDetails);
  }

  // Repairs the landlord is responsible for
  const landlordRepairs = read('what-repairs-landlord-responsibility', 'landlordRepairsDetails');
  pushTextRow('what-repairs-landlord-responsibility', 'landlordRepairsDetails', true, landlordRepairs);

  // Repairs the tenant is responsible for
  const tenantRepairs = read('what-repairs-tenant-responsibility', 'tenantRepairsDetails');
  pushTextRow('what-repairs-tenant-responsibility', 'tenantRepairsDetails', true, tenantRepairs);

  // Repairs and improvements
  const repairsAndImprovements = read('repairs-and-improvements', 'anyTenantsMadePropertyRepairs');

  pushChoiceRow('repairs-and-improvements', 'anyTenantsMadePropertyRepairs', repairsAndImprovements);

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
