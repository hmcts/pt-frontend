import { step as applicationType } from './application-type';
import { step as taskList } from './task-list';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const stepRegistry = {
  'task-list': taskList,
  'application-type': applicationType,
} satisfies Record<string, StepDefinition>;

export type ApplicationStepName = keyof typeof stepRegistry;
