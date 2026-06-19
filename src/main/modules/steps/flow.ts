/**
 * Reference: pcs-frontend/src/main/modules/steps/flow.ts
 * TODO: HDPD-506
 */
export type StepNavigation = Record<string, never>;

export function createStepNavigation(): StepNavigation {
  return {};
}

export function stepDependencyCheckMiddleware(): void {}
