import { Request } from 'express';

import { flowConfig } from '../../../../main/steps/pre-application/flow.config';

import { createFormStep } from '@modules/steps';
import { getPreviousStep } from '@modules/steps/flow';

jest.mock('@modules/steps', () => ({
  createFormStep: jest.fn(),
}));

import './../../../../main/steps/pre-application/only-challenging-validity-of-landlord-notice/index';

describe('only-challenging-validity-of-landlord-notice step', () => {
  const mockCreateFormStep = createFormStep as jest.Mock;

  const capturedConfig = mockCreateFormStep.mock.calls[0][0];

  it('passes the expected static config to createFormStep', () => {
    expect(mockCreateFormStep).toHaveBeenCalledTimes(1);
    expect(capturedConfig.stepName).toBe('only-challenging-validity-of-landlord-notice');
    expect(capturedConfig.journeyFolder).toBe('preApplication');
    expect(capturedConfig.showCancelButton).toBe(false);
    expect(capturedConfig.fields).toEqual([]);
  });

  describe('back navigation from only-challenging-validity-of-landlord-notice', () => {
    it('uses application-type as previous step', async () => {
      const req = {} as Request;
      await expect(getPreviousStep(req, 'only-challenging-validity-of-landlord-notice', flowConfig, {})).resolves.toBe(
        'application-type'
      );
    });
  });
});
