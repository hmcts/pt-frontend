import { step as doYouShareThePropertyWithLandlord } from './do-you-share-the-property-with-landlord';
import { step as doesTheTenancyIncludeOtherFacilities } from './does-the-tenancy-include-other-facilities';
import { step as floorPlanOfProperty } from './floor-plan-of-property';
import { step as indoorFeatures } from './indoor-features';
import { step as propertyAddress } from './property-address';
import { step as uploadFloorPlanOfProperty } from './upload-floor-plan-of-property';
import { step as uploadPhotoOutsideOfProperty } from './upload-photo-outside-of-property';
import { step as whatAreYouRenting } from './what-are-you-renting';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const thePropertyStepRegistry = {
  'what-are-you-renting': whatAreYouRenting,
  'floor-plan-of-property': floorPlanOfProperty,
  'upload-floor-plan-of-property': uploadFloorPlanOfProperty,
  'indoor-features': indoorFeatures,
  'does-the-tenancy-include-other-facilities': doesTheTenancyIncludeOtherFacilities,
  'do-you-share-the-property-with-landlord': doYouShareThePropertyWithLandlord,
  'upload-photo-outside-of-property': uploadPhotoOutsideOfProperty,
  'property-address': propertyAddress,
} satisfies Record<string, StepDefinition>;
