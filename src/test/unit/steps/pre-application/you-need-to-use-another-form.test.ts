import { Request } from 'express';

import { flowConfig } from '../../../../main/steps/pre-application/flow.config';

import { getPreviousStep } from '@modules/steps/flow';

jest.mock('../../../../main/modules/steps/i18n', () => ({
  loadStepNamespace: jest.fn(),
  getStepTranslations: jest.fn(() => ({})),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

jest.mock('../../../../main/modules/i18n', () => ({
  getRequestLanguage: jest.fn(() => 'en'),
  getCommonTranslations: jest.fn(() => ({})),
}));

jest.mock('../../../../main/modules/steps/formBuilder/helpers', () => {
  const actual = jest.requireActual('../../../../main/modules/steps/formBuilder/helpers');
  return {
    ...actual,
    validateForm: jest.fn(),
  };
});

describe('back navigation from you-need-to-use-another-form', () => {
  it('uses applying-for-yourself-or-someone-else as previous step', async () => {
    const req = {} as Request;
    await expect(getPreviousStep(req, 'you-need-to-use-another-form', flowConfig, {})).resolves.toBe(
      'applying-for-yourself-or-someone-else'
    );
  });
});
