import type { Application } from 'express';

import registerSteps from '../../../main/routes/registerSteps';

describe('registerSteps', () => {
  it('registers without error', () => {
    expect(() => registerSteps({} as Application)).not.toThrow();
  });
});
