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

  const startDate = { day: '1', month: '6', year: '2020' };

  it('is not answered when nothing has been selected', () => {
    expect(isAnswered({})).toBe(false);
  });

  it('is answered when no is selected', () => {
    expect(isAnswered({ currentTenancyReplaceOriginalTenancy: 'no' })).toBe(true);
  });

  it('is answered when not sure is selected', () => {
    expect(isAnswered({ currentTenancyReplaceOriginalTenancy: 'notSure' })).toBe(true);
  });

  it('is answered when yes is selected with a start date', () => {
    expect(isAnswered({ currentTenancyReplaceOriginalTenancy: 'yes', originalTenancyStartDate: startDate })).toBe(true);
  });

  it('is not answered when yes is selected without a start date', () => {
    expect(isAnswered({ currentTenancyReplaceOriginalTenancy: 'yes' })).toBe(false);
  });

  it('is not answered when yes is selected and the start date is empty', () => {
    expect(
      isAnswered({
        currentTenancyReplaceOriginalTenancy: 'yes',
        originalTenancyStartDate: { day: '', month: '', year: '' },
      })
    ).toBe(false);
  });
});
