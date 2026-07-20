import { step as applicationType } from './application-type';
import { step as checkYourAnswersAndSubmit } from './check-your-answers-and-submit';
import { step as contactPreferences } from './contact-preferences';
import { step as currentRentAndOtherCosts } from './current-rent-and-other-costs';
import { step as helpWithFees } from './help-with-fees';
import { step as inspectionAndHearing } from './inspection-and-hearing';
import { step as landlordDetails } from './landlord-details';
import { step as landlordsNotice } from './landlords-notice';
import { step as marketRent } from './market-rent';
import { step as propertyDetails } from './property-details';
import { step as supportForHealthConditions } from './support-for-health-conditions';
import { step as taskList } from './task-list';
import { step as tenancyAgreement } from './tenancy-agreement';
import { step as whoIsOnTheTenancy } from './who-is-on-the-tenancy';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const stepRegistry = {
  'task-list': taskList,
  'application-type': applicationType,
  'contact-preferences': contactPreferences,
  'who-is-on-the-tenancy': whoIsOnTheTenancy,
  'landlord-details': landlordDetails,
  'landlords-notice': landlordsNotice,
  'tenancy-agreement': tenancyAgreement,
  'current-rent-and-other-costs': currentRentAndOtherCosts,
  'market-rent': marketRent,
  'property-details': propertyDetails,
  'inspection-and-hearing': inspectionAndHearing,
  'support-for-health-conditions': supportForHealthConditions,
  'help-with-fees': helpWithFees,
  'check-your-answers-and-submit': checkYourAnswersAndSubmit,
} satisfies Record<string, StepDefinition>;

export type ApplicationStepName = keyof typeof stepRegistry;
