import type { SectionConfig } from '../../modules/steps/stepFlow.interface';

import type { ApplicationStepName } from './stepRegistry';

// Visual groups on the task-list page. Section order within a group follows declaration order below.
export const APPLICATION_SECTION_GROUPS = [
  { id: 'yourApplication', titleKey: 'taskList.groups.yourApplication' },
] as const;

export type ApplicationGroupId = (typeof APPLICATION_SECTION_GROUPS)[number]['id'];

const sectionDefs = [
  {
    id: 'applicationType',
    groupId: 'yourApplication',
    titleKey: 'taskList.applicationType',
    steps: ['application-type'],
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

export const CYA_STEP_PREFIX = 'check-your-answers-' as const;

export function sectionHasCya(section: SectionConfig): boolean {
  return section.steps.some(stepName => stepName.startsWith(CYA_STEP_PREFIX));
}

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
