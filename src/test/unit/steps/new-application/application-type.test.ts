import { createFormStep } from '@modules/steps';

jest.mock('@modules/steps', () => ({
  createFormStep: jest.fn(),
}));

import './../../../../main/steps/new-application/application-type/index';

describe('application-type step', () => {
  const mockCreateFormStep = createFormStep as jest.Mock;

  const capturedConfig = mockCreateFormStep.mock.calls[0][0];

  it('passes the expected static config to createFormStep', () => {
    expect(mockCreateFormStep).toHaveBeenCalledTimes(1);
    expect(capturedConfig.stepName).toBe('application-type');
    expect(capturedConfig.journeyFolder).toBe('newApplication');
    expect(capturedConfig.showCancelButton).toBe(false);
    expect(capturedConfig.fields).toEqual([]);
    expect(capturedConfig.translationKeys).toEqual({ pageTitle: 'questionTitle' });
  });
});
