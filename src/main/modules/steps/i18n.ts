/**
 * Reference: pcs-frontend/src/main/modules/steps/i18n.ts
 * TODO: HDPD-506
 */
export async function loadStepNamespace(): Promise<void> {}

export function getTranslationFunction(): (key: string) => string {
  return key => key;
}
