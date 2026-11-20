import type { Request } from 'express';
import type { TFunction } from 'i18next';

import {
  type SummaryListRow,
  escapeWithLineBreaks,
  getValidatedCase,
  isYes,
} from '../../../application/section-cya/cyaRow';

import type { PtCaseDocument } from '@services/ccd/ccdCase.interface';

const propertyTypes = ['room', 'flat', 'terracedHouse', 'semiDetachedHouse', 'fullyDetachedHouse', 'other'];

export function buildPropertyDetailsRows(req: Request, t: TFunction): SummaryListRow[] {
  const propertyDetails = getValidatedCase(req)?.propertyDetails;
  if (!propertyDetails) {
    return [];
  }

  const rows: SummaryListRow[] = [];

  const push = (labelKey: string, lines: (string | undefined)[]): void => {
    const shown = lines.filter((line): line is string => Boolean(line?.trim()));
    if (shown.length) {
      rows.push({
        key: { text: t(`propertyDetails.rows.${labelKey}`) },
        value: { html: shown.map(escapeWithLineBreaks).join('<br>') },
      });
    }
  };

  const answer = (value: unknown): string | undefined =>
    typeof value === 'string' && value.trim() !== '' ? t(`common:${value.trim().toLowerCase()}`) : undefined;

  const yesDetails = (value: unknown, details?: string): string | undefined =>
    typeof value === 'string' && isYes(value) ? details : undefined;

  const filenames = (documents?: PtCaseDocument[]): (string | undefined)[] =>
    (documents ?? []).map(document => document.filename);

  push('propertyAddress', [
    propertyDetails.addressLine1,
    propertyDetails.addressLine2,
    propertyDetails.postTown,
    propertyDetails.county,
    propertyDetails.postcode,
  ]);

  const propertyType = propertyDetails.propertyType;
  if (propertyType && propertyTypes.includes(propertyType)) {
    push('propertyType', [t(`propertyDetails.propertyType.${propertyType}`)]);
  }

  const floorPlan = propertyDetails.propertyFloorPlanAvailable;
  push('propertyFloorPlanAvailable', [answer(floorPlan)]);
  if (typeof floorPlan === 'string' && isYes(floorPlan)) {
    push('floorPlanDocuments', filenames(propertyDetails.floorPlanDocuments));
  }

  push('indoorFeatures', [propertyDetails.indoorFeatures]);
  const otherFacilities = propertyDetails.otherFacilitiesAvailable;
  const otherFacilitiesDetails = yesDetails(otherFacilities, propertyDetails.otherFacilitiesDetails);
  push('otherFacilitiesAvailable', [otherFacilitiesDetails?.trim() ? otherFacilitiesDetails : answer(otherFacilities)]);
  push('sharePropertyWithLandlord', [answer(propertyDetails.sharePropertyWithLandlord)]);
  push('outsidePropertyDocuments', filenames(propertyDetails.outsidePropertyDocuments));
  push('propertyRoomsDocuments', filenames(propertyDetails.propertyRoomsDocuments));
  push('furnitureProvidedInTenancy', [answer(propertyDetails.furnitureProvidedInTenancy)]);
  push('furnitureProvidedInTenancyDetails', [
    yesDetails(propertyDetails.furnitureProvidedInTenancy, propertyDetails.furnitureProvidedInTenancyDetails),
  ]);
  push('additionalServicesProvidedInTenancy', [answer(propertyDetails.additionalServicesProvidedInTenancy)]);
  push('landlordRepairsDetails', [propertyDetails.landlordRepairsDetails]);
  push('tenantRepairsDetails', [propertyDetails.tenantRepairsDetails]);

  return rows;
}
