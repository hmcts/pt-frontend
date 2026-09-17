import { step } from '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/current-tenancy-replace-original-tenancy';

jest.mock('../../../../main/modules/steps/i18n', () => ({
  loadStepNamespace: jest.fn(),
  getStepTranslations: jest.fn(() => ({})),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

jest.mock('../../../../main/modules/i18n', () => ({
  getRequestLanguage: jest.fn(() => 'en'),
  getCommonTranslations: jest.fn(() => ({})),
}));

describe('application current-tenancy-replace-original-tenancy step', () => {
  const isAnswered = (ccdCase: Record<string, unknown>): boolean => {
    if (!step.isAnswered) {
      throw new Error('expected isAnswered');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return step.isAnswered({ session: { ccdCase } } as any) as boolean;
  };

  const startDate = '2020-06-01T00:00:00';

  it('is not answered when nothing has been selected', () => {
    expect(isAnswered({ currentRentsDetails: {} })).toBe(false);
  });

  it('is answered when no is selected', () => {
    expect(isAnswered({ currentRentsDetails: { currentTenancyReplaceOriginalTenancy: 'No' } })).toBe(true);
  });

  it('is answered when not sure is selected', () => {
    expect(isAnswered({ currentRentsDetails: { currentTenancyReplaceOriginalTenancy: 'NotSure' } })).toBe(true);
  });

  it('is answered when yes is selected with a start date', () => {
    expect(
      isAnswered({
        currentRentsDetails: { currentTenancyReplaceOriginalTenancy: 'Yes', originalTenancyStartDate: startDate },
      })
    ).toBe(true);
  });

  it('is not answered when yes is selected without a start date', () => {
    expect(isAnswered({ currentRentsDetails: { currentTenancyReplaceOriginalTenancy: 'Yes' } })).toBe(false);
  });
});
