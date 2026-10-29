import type { NextFunction, Request, Response } from 'express';

import { requireCaseRole } from '../../../main/middleware/requireCaseRole';

import { CaseRole } from '@services/ccd/ccdCase.interface';

const TEST_CASE_ID = '1234123412341234';

const getCaseUsersMock = jest.fn();

jest.mock('@services/ccd/ccdApiClient', () => ({
  getCaseApi: jest.fn(() => ({
    getCaseUsers: (...args: unknown[]) => getCaseUsersMock(...args),
  })),
}));

describe('requireCaseRoleMiddleware', () => {
  const user = { id: 'user-id-1' };

  const build = () => {
    const req = {
      params: { caseReference: TEST_CASE_ID },
      session: { user },
    } as unknown as Request;
    const res = { redirect: jest.fn() } as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    return { req, res, next };
  };

  beforeEach(() => {
    getCaseUsersMock.mockReset();
    getCaseUsersMock.mockResolvedValue([{ case_id: TEST_CASE_ID, user_id: user.id, case_role: CaseRole.RESPONDENT }]);
  });

  it('allows user to access case journey if they have appropriate case role', async () => {
    const { req, res, next } = build();

    await requireCaseRole(CaseRole.RESPONDENT)(req, res, next);

    expect(getCaseUsersMock).toHaveBeenCalledWith(TEST_CASE_ID, user);
    expect(next).toHaveBeenCalledWith();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('redirects home if user does not have the required case role', async () => {
    const { req, res, next } = build();

    await requireCaseRole(CaseRole.CREATOR)(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith('/');
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects home if user has no case roles on the case', async () => {
    getCaseUsersMock.mockResolvedValue([]);
    const { req, res, next } = build();

    await requireCaseRole(CaseRole.RESPONDENT)(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith('/');
    expect(next).not.toHaveBeenCalled();
  });

  it('passes errors from CCD to next', async () => {
    const error = new Error('CCD unavailable');
    getCaseUsersMock.mockRejectedValue(error);
    const { req, res, next } = build();

    await requireCaseRole(CaseRole.RESPONDENT)(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
