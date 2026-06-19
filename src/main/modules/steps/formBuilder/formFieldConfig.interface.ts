/**
 * Reference: pcs-frontend/src/main/modules/steps/formBuilder/formFieldConfig.interface.ts
 * TODO: HDPD-503
 */
export interface FormFieldConfig {
  name: string;
  type: string;
}

export interface FormBuilderConfig {
  stepName: string;
  journeyFolder: string;
  fields: FormFieldConfig[];
  stepDir: string;
}
