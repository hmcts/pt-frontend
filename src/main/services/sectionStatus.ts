import type { Request } from 'express';

import type { JourneyFlowConfig, SectionConfig, SectionStatus } from '@modules/steps/stepFlow.interface';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export type { SectionStatus, SectionConfig, JourneyFlowConfig } from '../modules/steps/stepFlow.interface';
export type { StepDefinition } from '../modules/steps/stepFormData.interface';

const STATUS_TAG_CLASSES: Partial<Record<SectionStatus, string>> = {
  AVAILABLE: 'govuk-tag govuk-tag--blue',
  IN_PROGRESS: 'govuk-tag govuk-tag--yellow',
  DONE: 'govuk-tag govuk-tag--green',
  NOT_AVAILABLE_YET: 'govuk-tag govuk-tag--grey',
};

export const getStatusTagClasses = (status: SectionStatus): string | undefined => STATUS_TAG_CLASSES[status];

export function getFirstVisibleStep(
  section: SectionConfig,
  flowConfig: JourneyFlowConfig,
  req: Request
): string | undefined {
  return section.steps.find(stepName => isStepVisible(stepName, flowConfig, req));
}

export class SectionConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SectionConfigError';
  }
}

export function validateSectionConfig(flowConfig: JourneyFlowConfig): void {
  if (!flowConfig.sections) {
    return;
  }

  const sections = flowConfig.sections;
  const journeyLabel = flowConfig.journeyName ?? '(unnamed journey)';

  assertUniqueIds(sections, journeyLabel);
  assertReferencesResolve(sections, journeyLabel);
  assertDeclarationOrderIsTopological(sections, journeyLabel);
}

// Catches cycles too — any cycle has at least one back-reference.
function assertDeclarationOrderIsTopological(sections: readonly SectionConfig[], journeyLabel: string): void {
  const seen = new Set<string>();
  for (const section of sections) {
    for (const depId of section.dependsOn ?? []) {
      if (!seen.has(depId)) {
        throw new SectionConfigError(
          `Journey '${journeyLabel}': section '${section.id}' depends on '${depId}' which is not declared earlier — ` +
            'cyclic dependency or out-of-order declaration.'
        );
      }
    }
    seen.add(section.id);
  }
}

function isStepVisible(stepName: string, flowConfig: JourneyFlowConfig, req: Request): boolean {
  const stepConfig = flowConfig.steps[stepName];
  if (!stepConfig?.showCondition) {
    return true;
  }
  return stepConfig.showCondition(req);
}

// A thrown isAnswered must not crash the task-list — treat as unanswered.
export function safeIsAnswered(step: StepDefinition, req: Request): boolean {
  if (!step.isAnswered) {
    return false;
  }
  try {
    return !!step.isAnswered(req);
  } catch {
    return false;
  }
}

function assertUniqueIds(sections: readonly SectionConfig[], journeyLabel: string): void {
  const seen = new Set<string>();
  for (const section of sections) {
    if (seen.has(section.id)) {
      throw new SectionConfigError(`Journey '${journeyLabel}' has duplicate section id '${section.id}'.`);
    }
    seen.add(section.id);
  }
}

function assertReferencesResolve(sections: readonly SectionConfig[], journeyLabel: string): void {
  const ids = new Set(sections.map(s => s.id));
  for (const section of sections) {
    for (const depId of section.dependsOn ?? []) {
      if (depId === section.id) {
        throw new SectionConfigError(`Journey '${journeyLabel}': section '${section.id}' depends on itself.`);
      }
      if (!ids.has(depId)) {
        throw new SectionConfigError(
          `Journey '${journeyLabel}': section '${section.id}' depends on unknown section '${depId}'.`
        );
      }
    }
  }
}
