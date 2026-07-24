import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/pre-application/you-need-to-use-another-form-postcode/index';

jest.mock('@modules/steps', () => ({
  createFormStep: jest.fn(),
}));

describe('you-need-to-use-another-form-postcode step', () => {
  const mockCreateFormStep = createFormStep as jest.Mock;

  const capturedConfig = mockCreateFormStep.mock.calls[0][0];

  it('passes the expected static config to createFormStep', () => {
    expect(mockCreateFormStep).toHaveBeenCalledTimes(1);
    expect(capturedConfig.stepName).toBe('you-need-to-use-another-form-postcode');
    expect(capturedConfig.journeyFolder).toBe('preApplication');
    expect(capturedConfig.showCancelButton).toBe(false);
    expect(capturedConfig.fields).toEqual([]);
    expect(capturedConfig.translationKeys).toEqual({ pageTitle: 'questionTitle' });
  });

  describe('extendGetContent', () => {
    const makeReq = (formData?: Record<string, unknown>): Request => ({ session: { formData } }) as unknown as Request;

    it('returns the postcode when present', () => {
      const req = makeReq({
        'address-of-property': { addressPostcode: 'AB1 2CD' },
      });

      expect(capturedConfig.extendGetContent(req)).toEqual({ postcode: 'AB1 2CD' });
    });

    it('returns undefined when address-of-property is missing', () => {
      const req = makeReq({});
      expect(capturedConfig.extendGetContent(req)).toEqual({ postcode: undefined });
    });

    it('returns undefined when formData is missing entirely', () => {
      const req = makeReq(undefined);
      expect(capturedConfig.extendGetContent(req)).toEqual({ postcode: undefined });
    });
  });
});
