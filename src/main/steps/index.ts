import type { Request, RequestHandler } from 'express';

import { validateSectionConfig } from '../services/sectionStatus';

import { flowConfig as respondToClaimFlowConfig } from './pre-application/flow.config';
import { stepRegistry as respondToClaimStepRegistry } from './pre-application/stepRegistry';

import { Logger } from '@modules/logger';
import { getStepOrder } from '@modules/steps/flow';
import type { JourneyFlowConfig } from '@modules/steps/stepFlow.interface';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const logger = Logger.getLogger('steps');

export interface ResolvedJourneyConfig {
  flowConfig: JourneyFlowConfig;
  stepRegistry: Record<string, StepDefinition>;
}

export interface JourneyConfig {
  name: string;
  slug: string;
  // draftEvent?: CcdDraftEvent;
  default: ResolvedJourneyConfig;
  // Stacked onto the journey's :caseReference param callback (see registerAllJourneys).
  routeMiddleware?: RequestHandler[];
}

// JourneyVariant intentionally diverges from UserType ('citizen' | 'legalrep').
// 'citizen' maps to 'default' — the registry key chosen so journeys without a
// legalrep variant don't have to declare a 'citizen' key. Callers map at the
// call site (see uploadCtx in documentProxy.ts).
export type JourneyVariant = 'default' | 'legalrep';

// Journey registry - add new journeys here
export const journeyRegistry: Record<string, JourneyConfig> = {
  preApplication: {
    name: 'preApplication',
    slug: 'pre-application',
    // draftEvent: RESPOND_TO_CLAIM_DRAFT_EVENT,
    default: {
      flowConfig: respondToClaimFlowConfig,
      stepRegistry: respondToClaimStepRegistry,
    },
  },
};

// Startup invariants — fail loud at module load, not at request time.
// Exported for unit testing without re-importing the whole registry.
export function validateJourneyRegistry(registry: Record<string, JourneyConfig>): void {
  const seenSlugs = new Set<string>();
  for (const journey of Object.values(registry)) {
    if (seenSlugs.has(journey.slug)) {
      throw new Error(`Duplicate journey slug "${journey.slug}" in journeyRegistry`);
    }
    seenSlugs.add(journey.slug);

    // Sectionalised flows must have an acyclic dependsOn graph with valid refs.
    // No-op for flows without sections (legalrep, gen-app).
    validateSectionConfig(journey.default.flowConfig);
  }
}

validateJourneyRegistry(journeyRegistry);

export function journeyForSlug(slug: string): JourneyConfig | undefined {
  return Object.values(journeyRegistry).find(journey => journey.slug === slug);
}

// Variant-scoped step lookup. Variant is required (no default) to force every
// caller to think about citizen vs legalrep — a silent default would let a
// caller miss a legalrep-only step the day the registries diverge. Today the
// citizen and legalrep stepRegistries are the same imported object, so both
// variants resolve to the same step.
export function findStep(slug: string, stepName: string): StepDefinition | undefined {
  const journey = journeyForSlug(slug);
  if (!journey) {
    return undefined;
  }
  return journey.default?.stepRegistry[stepName];
}

function getJourneyConfigForRequest(journeyName: string): ResolvedJourneyConfig | undefined {
  const journey = journeyRegistry[journeyName];
  if (!journey) {
    logger.warn(`Failed to load JourneyConfig for journey name [${journeyName}]`);
    return undefined;
  }

  return journey.default;
}

function getRegistrationStepNames(journey: JourneyConfig): string[] {
  const stepNames = new Set<string>([
    ...getStepOrder(journey.default.flowConfig),
    ...Object.keys(journey.default.stepRegistry),
  ]);

  return Array.from(stepNames);
}

export function getFlowConfigForJourney(journeyName: string): JourneyFlowConfig | undefined {
  return getJourneyConfigForRequest(journeyName)?.flowConfig;
}

export function getStepForJourney(journeyName: string, stepName: string): StepDefinition | undefined {
  return getJourneyConfigForRequest(journeyName)?.stepRegistry[stepName];
}

// Helper function to get steps for a specific journey
export function getStepsForJourney(journeyName: string, req?: Request): StepDefinition[] {
  const journey = journeyRegistry[journeyName];
  if (!journey) {
    return [];
  }

  const activeJourney = getJourneyConfigForRequest(journeyName);
  const stepNames = req && activeJourney ? getStepOrder(activeJourney.flowConfig) : getRegistrationStepNames(journey);

  return stepNames
    .map(stepName => {
      if (req && activeJourney) {
        return activeJourney.stepRegistry[stepName];
      }

      return journey.default.stepRegistry[stepName];
    })
    .filter((step: StepDefinition | undefined): step is StepDefinition => step !== undefined);
}

export function shouldShowStep(req: Request, stepName: string, flowConfig: JourneyFlowConfig): boolean {
  const stepConfig = flowConfig.steps[stepName];
  if (!stepConfig || !stepConfig.showCondition) {
    return true;
  }

  return stepConfig.showCondition(req);
}
