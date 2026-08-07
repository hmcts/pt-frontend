import { flowConfig } from '../../../../main/steps/new-application/flow.config';

describe('new-application citizen flow config', () => {
  it('has stepOrder', () => {
    expect(flowConfig.stepOrder).toBeDefined();
    expect(flowConfig.stepOrder?.length).toBeGreaterThan(0);
    expect(flowConfig.stepOrder).toStrictEqual(['application-type', 'tenancy-type']);
  });

  it('has no sections defined', () => {
    expect(flowConfig.sections).toBeUndefined();
  });

  it('has hubStepName set to starting-or-returning', () => {
    expect(flowConfig.hubStepName).toBe('application-type');
  });
});
