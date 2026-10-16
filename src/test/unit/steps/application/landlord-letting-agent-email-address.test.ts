import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/landlord-details/landlord-letting-agent-email-address/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

describe('application landlord-letting-agent-email-address step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase: Record<string, unknown> = {}): Request => ({ session: { ccdCase } }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when no email address has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it('is answered when a valid email address has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq({ lettingAgentEmailAddress: 'agent@example.com' }))).toBe(true);
    });

    it('is not answered when the saved email address is not valid', () => {
      expect(capturedConfig.isAnswered(makeReq({ lettingAgentEmailAddress: 'agent@example' }))).toBe(false);
    });
  });

  describe('validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it('accepts a valid email address', () => {
      expect(validate('name@example.co.uk')).toBe(true);
    });

    it('returns the invalid error key for an email address in the wrong format', () => {
      expect(validate('name.example.com')).toBe('errors.lettingAgentEmailAddress.invalid');
    });
  });
});
