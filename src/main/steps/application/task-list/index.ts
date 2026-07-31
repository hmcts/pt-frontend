import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { APPLICATION_ROUTE, flowConfig } from '../flow.config';
import { APPLICATION_SECTION_GROUPS, type ApplicationGroupId, applicationSections } from '../sections.config';
import { stepRegistry } from '../stepRegistry';

import { createGetController, createStepNavigation, getTranslationFunction } from '@modules/steps';
import type { SectionConfig, SectionStatus } from '@modules/steps/stepFlow.interface';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { getPtApi } from '@services/ptApi/ptApiClient';
import { getAllSectionStatuses, getFirstVisibleStep, getStatusTagClasses } from '@services/sectionStatus';

const stepName = 'task-list';
const VIEW = 'application/task-list/taskList.njk';

const stepNavigation = createStepNavigation(() => flowConfig);

interface TaskListItem {
  title: { text: string };
  href?: string;
  status: { text?: string; tag?: { text: string; classes: string }; classes?: string };
  hint?: { text: string };
}

interface TaskListGroup {
  id: ApplicationGroupId;
  number: number;
  title: string;
  items: TaskListItem[];
}

export const step: StepDefinition = {
  url: `${APPLICATION_ROUTE}/${stepName}`,
  name: stepName,
  view: VIEW,
  stepDir: __dirname,
  getController: () =>
    createGetController(VIEW, stepName, stepNavigation, async (req: Request) => {
      const t: TFunction = getTranslationFunction(req);
      const caseReference = String(req.params.caseReference);

      const allStatuses = await getAllSectionStatuses(flowConfig, stepRegistry, req);
      const groups = buildGroups(allStatuses, t, req, caseReference);

      const user = req.session?.user;

      if (!req.session.ccdCase || req.session.ccdCase?.id !== caseReference) {
        const ptApi = getPtApi(user);
        req.session.ccdCase = await ptApi.getCaseByCaseReference(caseReference);
      }

      const name = [req.session.ccdCase?.applicantFirstName, req.session.ccdCase?.applicantLastName]
        .filter(Boolean)
        .join(' ');

      return {
        backUrl: '/',
        groups,
        name: name || 'Claimant',
      };
    }),
};

function buildGroups(
  allStatuses: Map<string, SectionStatus>,
  t: TFunction,
  req: Request,
  caseReference: string
): TaskListGroup[] {
  return APPLICATION_SECTION_GROUPS.map((group, index) => {
    const sectionsInGroup = applicationSections.filter(s => s.groupId === group.id);
    const items = sectionsInGroup
      .filter(section => allStatuses.get(section.id) !== 'NOT_APPLICABLE')
      .map(section => buildItem(section, allStatuses.get(section.id) ?? 'AVAILABLE', caseReference, t, req));
    return {
      id: group.id,
      number: index + 1,
      title: t(group.titleKey),
      items,
    };
  });
}

function buildItem(
  section: SectionConfig,
  status: SectionStatus,
  caseRef: string,
  t: TFunction,
  req: Request
): TaskListItem {
  const title = { text: t(section.titleKey) };
  const statusText = t(`taskList.status.${status}`);

  // Locked sections render the same tag as the rest, but without a link target.
  const firstStep = status === 'NOT_AVAILABLE_YET' ? undefined : getFirstVisibleStep(section, flowConfig, req);
  const href = firstStep ? `/${caseRef}/${firstStep}` : undefined;

  return {
    title,
    href,
    status: { tag: { text: statusText, classes: getStatusTagClasses(status) ?? '' } },
  };
}
