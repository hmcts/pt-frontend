import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/your-application/application-type/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

describe('application application-type step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase?: Record<string, unknown>): Request => ({ session: { ccdCase } }) as unknown as Request;

  it('is always answered because the type is chosen before the case is created', () => {
    expect(capturedConfig.isAnswered(makeReq())).toBe(true);
  });

  it('shows the application and tenancy type from the saved case', () => {
    const req = makeReq({ applicationType: 'challengeRentIncrease', tenancyType: 'assuredPeriodicTenancy' });

    expect(capturedConfig.extendGetContent(req)).toEqual({
      applicationType: 'challengeRentIncrease',
      tenancyType: 'assuredPeriodicTenancy',
    });
  });

  it('returns empty types when no case is loaded', () => {
    expect(capturedConfig.extendGetContent(makeReq())).toEqual({ applicationType: undefined, tenancyType: undefined });
  });
});
