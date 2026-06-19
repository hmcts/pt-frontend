/**
 * Reference: pcs-frontend/src/main/modules/steps/stepContext.ts
 * TODO: HDPD-506
 */
export interface StepContext {
  name: string;
  journey: string;
}

export function withStepContext(): void {}
