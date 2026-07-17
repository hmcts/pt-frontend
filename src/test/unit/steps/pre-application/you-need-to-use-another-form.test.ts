import { Request } from 'express';

import { flowConfig } from '../../../../main/steps/pre-application/flow.config';

import { createFormStep } from '@modules/steps';
import { getPreviousStep } from '@modules/steps/flow';

jest.mock('@modules/steps', () => ({
  createFormStep: jest.fn(),
}));

import './../../../../main/steps/pre-application/you-need-to-use-another-form/index';

describe('you-need-to-use-another-form-postcode step', () => {
  const mockCreateFormStep = createFormStep as jest.Mock;

  const capturedConfig = mockCreateFormStep.mock.calls[0][0];

  it('passes the expected static config to createFormStep', () => {
    expect(mockCreateFormStep).toHaveBeenCalledTimes(1);
    expect(capturedConfig.stepName).toBe('you-need-to-use-another-form');
    expect(capturedConfig.journeyFolder).toBe('preApplication');
    expect(capturedConfig.showCancelButton).toBe(false);
    expect(capturedConfig.fields).toEqual([]);
    expect(capturedConfig.translationKeys).toEqual({ pageTitle: 'questionTitle' });
  });

  describe('back navigation from you-need-to-use-another-form', () => {
    it('uses applying-for-yourself-or-someone-else as previous step', async () => {
      const req = {} as Request;
      await expect(getPreviousStep(req, 'you-need-to-use-another-form', flowConfig, {})).resolves.toBe(
        'applying-for-yourself-or-someone-else'
      );
    });
  });
});
