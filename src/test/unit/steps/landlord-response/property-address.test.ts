import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/landlord-response/your-response/property-address/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';
const STEP_NAME = 'property-address';

describe('landlord-response property-address step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (stepData: Record<string, unknown> = {}, ccdCase?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: { [STEP_NAME]: stepData } }, ccdCase },
    }) as unknown as Request;

  const isAnswered = (propertyAddress?: Record<string, unknown>): boolean =>
    capturedConfig.isAnswered(makeReq({}, { landlordResponse: { propertyAddress } }));

  describe('extendGetContent', () => {
    it('shows property address, skipping blank lines', () => {
      expect(
        capturedConfig.extendGetContent(
          makeReq(
            {},
            {
              propertyDetails: {
                addressLine1: '1 Main Street',
                addressLine2: '',
                postTown: 'London',
                postcode: 'SW1A 1AA',
              },
            }
          )
        )
      ).toEqual({
        tenantPropertyHtml: '1 Main Street<br>London<br>SW1A 1AA',
      });
    });

    describe('isAnswered', () => {
      it('is not answered when nothing has been saved', () => {
        expect(isAnswered()).toBe(false);
        expect(isAnswered({})).toBe(false);
      });

      it('is answered when the tenant address is confirmed as correct', () => {
        expect(isAnswered({ tenantProvidedCorrectAddress: 'Yes' }));
      });

      it('is answered when a corrected address has the first line, town and postcode', () => {
        expect(
          isAnswered({
            tenantProvidedCorrectAddress: 'No',
            addressLine1: '1 Main Street',
            postTown: 'London',
            postcode: 'SW1A 1AA',
          })
        ).toBe(true);
      });

      it.each([
        ['addressLine1', { tenantProvidedCorrectAddress: 'No', postTown: 'London', postcode: 'SW1A 1AA' }],
        ['postTown', { tenantProvidedCorrectAddres: 'No', addressLine1: '1 Main Street', postcode: 'SW1A 1AA' }],
        ['postcode', { tenantProvidedCorrectAddress: 'No', addressLine1: '1 Main Street', postTown: 'London' }],
      ])('is not answered when %s is missing', (_missing, propertyAddress) => {
        expect(isAnswered(propertyAddress)).toBe(false);
      });
    });

    describe('validators', () => {
      const validatorFor = (name: string): ((value: unknown) => boolean | string) =>
        capturedConfig.fields[0].options.find((option: { value: string }) => option.value === 'No').subFields[name]
          .validator;

      it.each([
        ['addressLine1', 'errors.addressLine1.invalid'],
        ['addressLine2', 'errors.addressLine2.invalid'],
        ['postTown', 'errors.postTown.invalid'],
        ['county', 'errors.county.invalid'],
      ])('rejects a one character %s', (name, errorKey) => {
        expect(validatorFor(name)('ab')).toBe(true);
        expect(validatorFor(name)('a')).toBe(errorKey);
      });

      it('accepts a valid postcode and returns the error key for an invalid one', () => {
        expect(validatorFor('postcode')('LS1 1AA')).toBe(true);
        expect(validatorFor('postcode')('not a postcode')).toBe('errors.postcode.invalid');
      });
    });

    describe('beforeRedirect', () => {
      it('clears the address fields when the tenant address is confirmed as correct', () => {
        const stepData = {
          tenantProvidedCorrectAddress: 'Yes',
          'tenantProvidedCorrectAddress.addressLine1': '1 Main Street',
          'tenantProvidedCorrectAddress.addressLine2': 'Flat2',
          'tenantProvidedCorrectAddress.county': 'Greater London',
          'tenantProvidedCorrectAddress.postTown': 'London',
          'tenantProvidedCorrectAddress.postcode': 'SW1 1AA',
        };

        capturedConfig.beforeRedirect(makeReq(stepData));

        expect(stepData).toEqual({ tenantProvidedCorrectAddress: 'Yes' });
      });
    });

    it('keeps the address fields when tenant address is corrected', () => {
      const stepData = {
        tenantProvidedCorrectAddress: 'No',
        'tenantProvidedCorrectAddress.addressLine1': '1 Main Street',
        'tenantProvidedCorrectAddress.addressLine2': 'Flat2',
        'tenantProvidedCorrectAddress.county': 'Greater London',
        'tenantProvidedCorrectAddress.postTown': 'London',
        'tenantProvidedCorrectAddress.postcode': 'SW1 1AA',
      };
      const expected = { ...stepData };

      capturedConfig.beforeRedirect(makeReq(stepData));

      expect(stepData).toEqual(expected);
    });
  });
});
