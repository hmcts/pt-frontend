import type { Request } from 'express';

import { step } from '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/current-tenancy-replace-original-tenancy';

import { createFormStep } from '@modules/steps';

jest.mock('@modules/steps', () => {
  const actual = jest.requireActual('@modules/steps');
  return { ...actual, createFormStep: jest.fn(actual.createFormStep) };
});

jest.mock('../../../../main/modules/steps/i18n', () => ({
  loadStepNamespace: jest.fn(),
  getStepTranslations: jest.fn(() => ({})),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

jest.mock('../../../../main/modules/i18n', () => ({
  getRequestLanguage: jest.fn(() => 'en'),
  getCommonTranslations: jest.fn(() => ({})),
}));

const CASE_REF = '1234123412341234';

describe('application current-tenancy-replace-original-tenancy step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];
  const stepName = 'current-tenancy-replace-original-tenancy';
  const dayField = 'currentTenancyReplaceOriginalTenancy.originalTenancyStartDate-day';
  const monthField = 'currentTenancyReplaceOriginalTenancy.originalTenancyStartDate-month';
  const yearField = 'currentTenancyReplaceOriginalTenancy.originalTenancyStartDate-year';

  const isAnswered = (ccdCase: Record<string, unknown>): boolean => {
    if (!step.isAnswered) {
      throw new Error('expected isAnswered');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return step.isAnswered({ session: { ccdCase } } as any) as boolean;
  };

  const startDate = '2020-06-01T00:00:00';

  it('is not answered when nothing has been selected', () => {
    expect(isAnswered({ rentDetails: {} })).toBe(false);
  });

  it('is answered when no is selected', () => {
    expect(isAnswered({ rentDetails: { currentTenancyReplaceOriginalTenancy: 'No' } })).toBe(true);
  });

  it('is answered when not sure is selected', () => {
    expect(isAnswered({ rentDetails: { currentTenancyReplaceOriginalTenancy: 'NotSure' } })).toBe(true);
  });

  it('is answered when yes is selected with a start date', () => {
    expect(
      isAnswered({
        rentDetails: {
          currentTenancyReplaceOriginalTenancy: 'Yes',
          originalTenancyStartDate: startDate,
        },
      })
    ).toBe(true);
  });

  it('is not answered when yes is selected without a start date', () => {
    expect(isAnswered({ rentDetails: { currentTenancyReplaceOriginalTenancy: 'Yes' } })).toBe(false);
  });

  const makeReq = (formData: Record<string, unknown> = {}, rentDetails?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { rentDetails } },
    }) as unknown as Request;

  describe('beforeRedirect', () => {
    const dateParts = { [dayField]: '1', [monthField]: '6', [yearField]: '2020' };

    it('clears the original start date when the answer is not yes', () => {
      const req = makeReq({ [stepName]: { currentTenancyReplaceOriginalTenancy: 'NotSure', ...dateParts } });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF][stepName]).toEqual({
        currentTenancyReplaceOriginalTenancy: 'NotSure',
        [dayField]: '',
        [monthField]: '',
        [yearField]: '',
      });
    });

    it('keeps the original start date when the answer is yes', () => {
      const req = makeReq({ [stepName]: { currentTenancyReplaceOriginalTenancy: 'Yes', ...dateParts } });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF][stepName]).toEqual({
        currentTenancyReplaceOriginalTenancy: 'Yes',
        ...dateParts,
      });
    });
  });

  describe('getInitialFormData', () => {
    it('prefers the answer and date parts from the form data over the saved case', () => {
      const req = makeReq(
        {
          [stepName]: {
            currentTenancyReplaceOriginalTenancy: 'Yes',
            [dayField]: '3',
            [monthField]: '4',
            [yearField]: '2019',
          },
        },
        { currentTenancyReplaceOriginalTenancy: 'Yes', originalTenancyStartDate: startDate }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        currentTenancyReplaceOriginalTenancy: 'Yes',
        [dayField]: '3',
        [monthField]: '4',
        [yearField]: '2019',
      });
    });

    it('splits the saved original start date into day, month and year', () => {
      const req = makeReq({}, { currentTenancyReplaceOriginalTenancy: 'Yes', originalTenancyStartDate: startDate });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        currentTenancyReplaceOriginalTenancy: 'Yes',
        [dayField]: '01',
        [monthField]: '06',
        [yearField]: '2020',
      });
    });

    it('does not return the saved start date once the answer has been changed from yes', () => {
      const req = makeReq(
        { [stepName]: { currentTenancyReplaceOriginalTenancy: 'No' } },
        { currentTenancyReplaceOriginalTenancy: 'Yes', originalTenancyStartDate: startDate }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({ currentTenancyReplaceOriginalTenancy: 'No' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
