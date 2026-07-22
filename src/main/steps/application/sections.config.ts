import type { SectionConfig } from '../../modules/steps/stepFlow.interface';

import type { ApplicationStepName } from './stepRegistry';

// Visual groups on the task-list page. Section order within a group follows declaration order below.
export const APPLICATION_SECTION_GROUPS = [
  { id: 'yourApplication', titleKey: 'taskList.groups.yourApplication' },
  { id: 'tenantDetails', titleKey: 'taskList.groups.tenantDetails' },
  { id: 'landlordDetails', titleKey: 'taskList.groups.landlordDetails' },
  { id: 'applicationDocuments', titleKey: 'taskList.groups.applicationDocuments' },
  { id: 'theRent', titleKey: 'taskList.groups.theRent' },
  { id: 'theProperty', titleKey: 'taskList.groups.theProperty' },
  { id: 'inspectionAndHearing', titleKey: 'taskList.groups.inspectionAndHearing' },
  { id: 'supportForHealthConditions', titleKey: 'taskList.groups.supportForHealthConditions' },
  { id: 'reviewSubmitAndPay', titleKey: 'taskList.groups.reviewSubmitAndPay' },
] as const;

export type ApplicationGroupId = (typeof APPLICATION_SECTION_GROUPS)[number]['id'];

const sectionDefs = [
  {
    id: 'applicationType',
    groupId: 'yourApplication',
    titleKey: 'taskList.applicationType',
    steps: ['application-type'],
  },
  {
    id: 'contactPreferences',
    groupId: 'yourApplication',
    titleKey: 'taskList.contactPreferences',
    steps: ['contact-preferences'],
  },
  {
    id: 'whoIsOnTheTenancy',
    groupId: 'tenantDetails',
    titleKey: 'taskList.whoIsOnTheTenancy',
    steps: ['your-information'],
  },
  {
    id: 'landlordDetails',
    groupId: 'landlordDetails',
    titleKey: 'taskList.landlordDetails',
    steps: ['landlord-name'],
  },
  {
    id: 'landlordsNotice',
    groupId: 'applicationDocuments',
    titleKey: 'taskList.landlordsNotice',
    steps: ['have-landlords-notice'],
  },
  {
    id: 'yourTenancyAgreement',
    groupId: 'applicationDocuments',
    titleKey: 'taskList.yourTenancyAgreement',
    steps: ['have-tenancy-agreement'],
  },
  {
    id: 'theCurrentRentAndOtherCosts',
    groupId: 'theRent',
    titleKey: 'taskList.theCurrentRentAndOtherCosts',
    steps: ['current-rent-and-other-costs'],
  },
  {
    id: 'whatYouThinkMarketRentShouldBe',
    groupId: 'theRent',
    titleKey: 'taskList.whatYouThinkMarketRentShouldBe',
    steps: ['proposed-market-rent'],
  },
  {
    id: 'propertyDetails',
    groupId: 'theProperty',
    titleKey: 'taskList.propertyDetails',
    steps: ['property-address'],
  },
  {
    id: 'propertyInspection',
    groupId: 'inspectionAndHearing',
    titleKey: 'taskList.propertyInspection',
    steps: ['property-inspection'],
  },
  {
    id: 'extraSupport',
    groupId: 'supportForHealthConditions',
    titleKey: 'taskList.extraSupport',
    steps: ['extra-support'],
  },
  {
    id: 'tellUsIfYouNeedHelp',
    groupId: 'reviewSubmitAndPay',
    titleKey: 'taskList.tellUsIfYouNeedHelp',
    steps: ['help-with-fees'],
  },
  {
    id: 'checkYourAnswersAndSubmit',
    groupId: 'reviewSubmitAndPay',
    titleKey: 'taskList.checkYourAnswersAndSubmit',
    dependsOn: [
      'applicationType',
      'contactPreferences',
      'whoIsOnTheTenancy',
      'landlordDetails',
      'landlordsNotice',
      'yourTenancyAgreement',
      'theCurrentRentAndOtherCosts',
      'whatYouThinkMarketRentShouldBe',
      'propertyDetails',
      'propertyInspection',
      'extraSupport',
      'tellUsIfYouNeedHelp',
    ],
    steps: ['check-your-answers-and-submit'],
  },
] as const satisfies readonly {
  id: string;
  groupId: string;
  titleKey: string;
  steps: readonly ApplicationStepName[];
  dependsOn?: readonly string[];
}[];

export type ApplicationSectionId = (typeof sectionDefs)[number]['id'];

export const APPLICATION_SECTION_IDS: readonly ApplicationSectionId[] = sectionDefs.map(s => s.id);

export const applicationSections: readonly SectionConfig[] = sectionDefs;

export const sectionById: ReadonlyMap<ApplicationSectionId, SectionConfig> = new Map(
  sectionDefs.map(section => [section.id, section as unknown as SectionConfig])
);

export function findSectionIdForStep(stepName: string): ApplicationSectionId | undefined {
  return stepToSectionId.get(stepName);
}

const stepToSectionId = buildStepToSectionIdMap();

function buildStepToSectionIdMap(): Map<string, ApplicationSectionId> {
  const map = new Map<string, ApplicationSectionId>();
  for (const section of sectionDefs) {
    for (const stepName of section.steps) {
      if (map.has(stepName)) {
        throw new Error(`Step "${stepName}" appears in more than one application section`);
      }
      map.set(stepName, section.id);
    }
  }
  return map;
}
