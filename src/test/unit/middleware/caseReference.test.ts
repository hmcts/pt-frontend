import type { NextFunction, Request, Response } from 'express';

import { caseSessionScopeMiddleware } from '../../../main/middleware/caseReference';

jest.mock('@modules/logger', () => ({
  Logger: { getLogger: () => ({ debug: jest.fn(), error: jest.fn() }) },
}));

describe('caseSessionScopeMiddleware', () => {
  const CASE_A = '1234123412341234';
  const CASE_B = '9999999999999999';

  const build = (caseReference: string | undefined, session: Record<string, unknown>) => {
    const req = {
      params: caseReference ? { caseReference } : {},
      session,
    } as unknown as Request;
    const res = { locals: {} } as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    return { req, res, next };
  };

  it('records the case on first visit', () => {
    const { req, res, next } = build(CASE_A, {});

    caseSessionScopeMiddleware(req, res, next);

    expect(req.session.activeCaseReference).toBe(CASE_A);
    expect(next).toHaveBeenCalledWith();
  });

  it('drops case-derived state when the case changes', () => {
    const session = {
      activeCaseReference: CASE_A,
      ccdCase: { caseReference: CASE_A },
      returnToCya: `/${CASE_A}/check-your-answers`,
    };
    const { req, res, next } = build(CASE_B, session);

    caseSessionScopeMiddleware(req, res, next);

    expect(req.session.ccdCase).toBeUndefined();
    expect(req.session.returnToCya).toBeUndefined();
    expect(req.session.activeCaseReference).toBe(CASE_B);
    expect(next).toHaveBeenCalledWith();
  });

  it('leaves state alone when staying on the same case', () => {
    const ccdCase = { caseReference: CASE_A };
    const session = { activeCaseReference: CASE_A, ccdCase, returnToCya: '/somewhere' };
    const { req, res, next } = build(CASE_A, session);

    caseSessionScopeMiddleware(req, res, next);

    expect(req.session.ccdCase).toBe(ccdCase);
    expect(req.session.returnToCya).toBe('/somewhere');
  });

  it('leaves the bucketed answers untouched — they are keyed per case already', () => {
    const formData = { [CASE_A]: { step1: { field1: 'case A' } } };
    const { req, res, next } = build(CASE_B, { activeCaseReference: CASE_A, formData });

    caseSessionScopeMiddleware(req, res, next);

    expect(req.session.formData).toBe(formData);
    expect(req.session.formData?.[CASE_A]).toEqual({ step1: { field1: 'case A' } });
  });

  it('does nothing when the route carries no case reference', () => {
    const { req, res, next } = build(undefined, { activeCaseReference: CASE_A, ccdCase: { caseReference: CASE_A } });

    caseSessionScopeMiddleware(req, res, next);

    expect(req.session.activeCaseReference).toBe(CASE_A);
    expect(req.session.ccdCase).toBeDefined();
    expect(next).toHaveBeenCalledWith();
  });
});
