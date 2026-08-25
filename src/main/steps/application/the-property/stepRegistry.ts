import { step as checkYourAnswersTheProperty } from './check-your-answers-the-property';
import { step as doYouShareThePropertyWithLandlord } from './do-you-share-the-property-with-landlord';
import { step as doesTheTenancyIncludeOtherFacilities } from './does-the-tenancy-include-other-facilities';
import { step as floorPlanOfProperty } from './floor-plan-of-property';
import { step as furnitureProvidedTenancy } from './furniture-provided-tenancy';
import { step as indoorFeatures } from './indoor-features';
import { step as propertyAddress } from './property-address';
import { step as repairsAndImprovements } from './repairs-and-improvements';
import { step as servicesProvidedTenancy } from './services-provided-tenancy';
import { step as uploadEvidenceImprovementsOrRepairs } from './upload-evidence-improvements-or-repairs';
import { step as uploadFloorPlanOfProperty } from './upload-floor-plan-of-property';
import { step as uploadPhotoOutsideOfProperty } from './upload-photo-outside-of-property';
import { step as whatAreYouRenting } from './what-are-you-renting';
import { step as whatRepairsLandlordResponsibility } from './what-repairs-landlord-responsibility';
import { step as whatRepairsTenantResponsibility } from './what-repairs-tenant-responsibility';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const thePropertyStepRegistry = {
  'what-are-you-renting': whatAreYouRenting,
  'floor-plan-of-property': floorPlanOfProperty,
  'upload-floor-plan-of-property': uploadFloorPlanOfProperty,
  'indoor-features': indoorFeatures,
  'does-the-tenancy-include-other-facilities': doesTheTenancyIncludeOtherFacilities,
  'do-you-share-the-property-with-landlord': doYouShareThePropertyWithLandlord,
  'upload-photo-outside-of-property': uploadPhotoOutsideOfProperty,
  'furniture-provided-tenancy': furnitureProvidedTenancy,
  'services-provided-tenancy': servicesProvidedTenancy,
  'what-repairs-landlord-responsibility': whatRepairsLandlordResponsibility,
  'what-repairs-tenant-responsibility': whatRepairsTenantResponsibility,
  'repairs-and-improvements': repairsAndImprovements,
  'upload-evidence-improvements-or-repairs': uploadEvidenceImprovementsOrRepairs,
  'check-your-answers-the-property': checkYourAnswersTheProperty,
  'property-address': propertyAddress,
} satisfies Record<string, StepDefinition>;
