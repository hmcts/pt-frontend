import { step as rogueTaskOne } from './rogue-task-one/index';
import { step as rogueTaskTwo } from './rogue-task-two/index';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const rogueTasksStepRegistry = {
  'rogue-task-one': rogueTaskOne,
  'rogue-task-two': rogueTaskTwo,
} satisfies Record<string, StepDefinition>;
