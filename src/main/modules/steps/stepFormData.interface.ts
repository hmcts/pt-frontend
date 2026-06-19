/**
 * Reference: pcs-frontend/src/main/modules/steps/stepFormData.interface.ts
 * TODO: HDPD-503
 */
export interface StepFormData {
  [key: string]: unknown;
}

export interface StepDefinition {
  url: string;
  name: string;
  view: string;
}
