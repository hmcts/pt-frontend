import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/rent-payment-frequency';
import '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/council-tax-frequency';
import '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/utilities-paid-frequency';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

const configFor = (stepName: string) =>
  (createFormStep as jest.Mock).mock.calls.map(call => call[0]).find(config => config.stepName === stepName);

const reqWith = (formData: Record<string, unknown>, currentRentsDetails: Record<string, unknown> = {}): Request =>
  ({
    params: { caseReference: CASE_REF },
    session: { formData: { [CASE_REF]: formData }, ccdCase: { currentRentsDetails } },
  }) as unknown as Request;

describe.each([
  ['rent-payment-frequency', 'rentPaymentFrequency', 'rentCostWeekly', 'rentCostWeekly'],
  ['council-tax-frequency', 'councilTaxFrequency', 'councilTaxCostWeekly', 'councilTaxCostWeekly'],
  ['utilities-paid-frequency', 'utilitiesPaidFrequency', 'utilitiesPaidCostWeekly', 'utilitiesCostWeekly'],
])('%s getInitialFormData', (stepName, frequencyField, amountField, savedField) => {
  const amountKey = `${frequencyField}.${amountField}`;
  const getInitialFormData = (req: Request) => configFor(stepName).getInitialFormData(req);

  it('shows a saved amount to two decimal places', () => {
    const req = reqWith({}, { [frequencyField]: 'weekly', [savedField]: 120.5 });

    expect(getInitialFormData(req)).toEqual({ [frequencyField]: 'weekly', [amountKey]: '120.50' });
  });

  it('keeps a saved zero', () => {
    const req = reqWith({}, { [frequencyField]: 'weekly', [savedField]: 0 });

    expect(getInitialFormData(req)).toEqual({ [frequencyField]: 'weekly', [amountKey]: '0.00' });
  });

  it('returns a typed amount as it was entered', () => {
    const req = reqWith({ [stepName]: { [frequencyField]: 'weekly', [amountKey]: '120.5' } });

    expect(getInitialFormData(req)).toEqual({ [frequencyField]: 'weekly', [amountKey]: '120.5' });
  });
});
