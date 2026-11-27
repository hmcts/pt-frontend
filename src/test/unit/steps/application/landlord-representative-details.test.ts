import { createFormStep } from '@modules/steps';

jest.mock('@modules/steps', () => {
  const actual = jest.requireActual('@modules/steps');
  return {
    ...actual,
    createFormStep: jest.fn(),
  };
});

import '../../../../main/steps/application/landlord-details/landlord-representative-details/index';

describe('landlord-representative-details step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  beforeEach(() => jest.clearAllMocks());

  it('defines the expected representative details fields', () => {
    expect(capturedConfig.stepName).toBe('landlord-representative-details');
    expect(capturedConfig.fields).toEqual([
      expect.objectContaining({ name: 'representativeFirstName', type: 'text', required: true, maxLength: 100 }),
      expect.objectContaining({ name: 'representativeLastName', type: 'text', required: true, maxLength: 100 }),
      expect.objectContaining({ name: 'representativeCompanyName', type: 'text', required: false, maxLength: 100 }),
    ]);
  });

  it('rejects first and last names that include invalid characters', () => {
    const firstNameField = capturedConfig.fields.find(
      (field: { name: string }) => field.name === 'representativeFirstName'
    );
    const lastNameField = capturedConfig.fields.find(
      (field: { name: string }) => field.name === 'representativeLastName'
    );

    expect(firstNameField.validator('Mary-Jane')).toBe(true);
    expect(firstNameField.validator("O'Brien")).toBe(true);
    expect(firstNameField.validator('John2')).toBe('errors.representativeFirstName.invalid');

    expect(lastNameField.validator('Van Dyke')).toBe(true);
    expect(lastNameField.validator('Smith@')).toBe('errors.representativeLastName.invalid');
  });

  it('rejects a one character company name and allows blank or valid values', () => {
    const companyNameField = capturedConfig.fields.find(
      (field: { name: string }) => field.name === 'representativeCompanyName'
    );

    expect(companyNameField.validator('a')).toBe('errors.representativeCompanyName.tooShort');
    expect(companyNameField.validator('ab')).toBe(true);
    expect(companyNameField.validator('')).toBe(true);
    expect(companyNameField.validator(undefined)).toBe(true);
  });

  it('pre-populates values from CCVD when form data is empty', () => {
    const req = {
      params: { caseReference: '1234123412341234' },
      session: {
        formData: {},
        ccdCase: {
          landlordDetails: {
            representative: { firstName: 'Alex', lastName: 'Jones', organisationName: 'Jones Lettings' },
          },
        },
      },
    };

    expect(capturedConfig.getInitialFormData(req)).toEqual({
      representativeFirstName: 'Alex',
      representativeLastName: 'Jones',
      representativeCompanyName: 'Jones Lettings',
    });
  });

  it('prefers saved form data over CCD values', () => {
    const CASE_REF = '1234123412341234';
    const req = {
      params: { caseReference: CASE_REF },
      session: {
        user: { givenName: 'John', familyName: 'Smith' },
        formData: {
          [CASE_REF]: {
            'landlord-representative-details': {
              representativeFirstName: 'Amended',
              representativeLastName: 'Name',
              representativeCompanyName: 'Smith Company',
            },
          },
        },
        ccdCase: {
          landlordDetails: {
            representative: { firstName: 'CcdFirst', lastName: 'CcdLast', organisationName: 'Ccd Co' },
          },
        },
      },
    };

    expect(capturedConfig.getInitialFormData(req)).toEqual({
      representativeFirstName: 'Amended',
      representativeLastName: 'Name',
      representativeCompanyName: 'Smith Company',
    });
  });

  it('is answered when both representative names are present on the case', () => {
    expect(
      capturedConfig.isAnswered({
        session: {
          ccdCase: { landlordDetails: { representative: { firstName: 'John', lastName: 'Smith' } } },
        },
      })
    ).toBe(true);
    expect(
      capturedConfig.isAnswered({
        session: { ccdCase: { landlordDetails: { representative: { firstName: 'John' } } } },
      })
    ).toBe(false);
  });
});
