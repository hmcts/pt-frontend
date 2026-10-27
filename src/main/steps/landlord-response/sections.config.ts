import type { SectionConfig } from '../../modules/steps/stepFlow.interface';

import type { LandlordResponseStepName } from './stepRegistry';

// Visual groups on the task-list page. Section order within a group follows declaration order below.
export const LANDLORD_RESPONSE_SECTION_GROUPS = [
  { id: 'tenantsApplication', titleKey: 'taskList.groups.tenantsApplication' },
  { id: 'yourResponse', titleKey: 'taskList.groups.yourResponse' },
  { id: 'tribunalsDetermination', titleKey: 'taskList.groups.tribunalsDetermination' },
] as const;

export type LandlordResponseGroupId = (typeof LANDLORD_RESPONSE_SECTION_GROUPS)[number]['id'];

const sectionDefs = [
  {
    id: 'tenantsApplication',
    groupId: 'tenantsApplication',
    titleKey: 'taskList.tenantsApplication',
    steps: ['view-tenants-application'],
  },
  {
    id: 'yourResponse',
    groupId: 'yourResponse',
    titleKey: 'taskList.yourResponse',
    steps: ['respond-to-tenants-application'],
  },
  {
    id: 'tribunalsDetermination',
    groupId: 'tribunalsDetermination',
    titleKey: 'taskList.tribunalsDetermination',
    steps: ['view-tribunals-determination'],
  },
] as const satisfies readonly {
  id: string;
  groupId: string;
  titleKey: string;
  steps: readonly LandlordResponseStepName[];
  dependsOn?: readonly string[];
}[];

export type LandlordResponseSectionId = (typeof sectionDefs)[number]['id'];

export const LANDLORD_RESPONSE_SECTION_IDS: readonly LandlordResponseSectionId[] = sectionDefs.map(s => s.id);

export const landlordResponseSections: readonly SectionConfig[] = sectionDefs;

export const sectionById: ReadonlyMap<LandlordResponseSectionId, SectionConfig> = new Map(
  sectionDefs.map(section => [section.id, section as unknown as SectionConfig])
);

export function findSectionIdForStep(stepName: string): LandlordResponseSectionId | undefined {
  return stepToSectionId.get(stepName);
}

const stepToSectionId = buildStepToSectionIdMap();

function buildStepToSectionIdMap(): Map<string, LandlordResponseSectionId> {
  const map = new Map<string, LandlordResponseSectionId>();
  for (const section of sectionDefs) {
    for (const stepName of section.steps) {
      if (map.has(stepName)) {
        throw new Error(`Step "${stepName}" appears in more than one landlord response section`);
      }
      map.set(stepName, section.id);
    }
  }
  return map;
}
