import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/landlord-details/landlord-has-letting-agent-or-representative/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

describe('application landlord-has-letting-agent-or-representative step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase: Record<string, unknown> = {}): Request => ({ session: { ccdCase } }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when the question has not been answered', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it.each([
      'lettingAgentOnly',
      'representativeOnly',
      'lettingAgentAndRepresentative',
      'noLettingAgentAndRepresentative',
      'notSure',
    ])('is answered when the citizen chose %s', answer => {
      expect(capturedConfig.isAnswered(makeReq({ landlordHasLettingAgentOrRepresentative: answer }))).toBe(true);
    });
  });
});
