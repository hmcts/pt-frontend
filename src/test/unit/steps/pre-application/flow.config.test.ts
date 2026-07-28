import { flowConfig } from '../../../../main/steps/pre-application/flow.config';

describe('pre-application citizen flow config', () => {
  it('has stepOrder', () => {
    expect(flowConfig.stepOrder).toBeDefined();
    expect(flowConfig.stepOrder?.length).toBeGreaterThan(0);
    expect(flowConfig.stepOrder).toStrictEqual([
      'starting-or-returning',
      'applying-for-yourself-or-someone-else',
      'you-need-to-use-another-form',
      'address-of-property',
      'you-need-to-use-another-form-postcode',
      'you-need-to-use-another-form-non-english-address',
      'landlord-is-a-housing-association',
      'you-need-to-use-another-form-landlord-association',
    ]);
  });

  it('has no sections defined', () => {
    expect(flowConfig.sections).toBeUndefined();
  });

  it('has hubStepName set to starting-or-returning', () => {
    expect(flowConfig.hubStepName).toBe('starting-or-returning');
  });
});
