import { createFormStep } from '@modules/steps';

jest.mock('@modules/steps', () => {
  const actual = jest.requireActual('@modules/steps');
  return {
    ...actual,
    createFormStep: jest.fn(),
  };
});

import './../../../../main/steps/application/tenant-details/your-information/index';

describe('your-information step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  beforeEach(() => jest.clearAllMocks());

  it('defines the expected personal information fields', () => {
    expect(capturedConfig.stepName).toBe('your-information');
    expect(capturedConfig.fields).toEqual([
      expect.objectContaining({ name: 'applicantFirstName', type: 'text', required: true, maxLength: 100 }),
      expect.objectContaining({ name: 'applicantLastName', type: 'text', required: true, maxLength: 100 }),
      expect.objectContaining({ name: 'companyName', type: 'text', required: false, maxLength: 100 }),
      expect.objectContaining({
        name: 'referenceNumberForCommunications',
        type: 'text',
        required: false,
        translationKey: expect.objectContaining({ hint: 'hints.referenceNumberForCommunications' }),
      }),
    ]);
  });

  it('pre-populates first and last name from IDAM when CCD has no values', () => {
    const req = {
      params: { caseReference: '1234123412341234' },
      session: {
        user: { givenName: 'John', familyName: 'Smith' },
        formData: {},
        ccdCase: {},
      },
    };

    expect(capturedConfig.getInitialFormData(req)).toEqual({
      applicantFirstName: 'John',
      applicantLastName: 'Smith',
    });
  });

  it('prefers saved form data over CCD and IDAM values', () => {
    const CASE_REF = '1234123412341234';
    const req = {
      params: { caseReference: CASE_REF },
      session: {
        user: { givenName: 'John', familyName: 'Smith' },
        formData: {
          [CASE_REF]: {
            'your-information': {
              applicantFirstName: 'Amended',
              applicantLastName: 'Name',
              companyName: 'Smith Company',
              referenceNumberForCommunications: 'AB123',
            },
          },
        },
        ccdCase: {
          applicantFirstName: 'CcdFirst',
          applicantLastName: 'CcdLast',
          tenantDetails: {
            companyName: 'Ccd Co',
            referenceNumberForCommunications: 'CCD1',
          },
        },
      },
    };

    expect(capturedConfig.getInitialFormData(req)).toEqual({
      applicantFirstName: 'Amended',
      applicantLastName: 'Name',
      companyName: 'Smith Company',
      referenceNumberForCommunications: 'AB123',
    });
  });

  it('is answered when both applicant names are present on the case', () => {
    expect(
      capturedConfig.isAnswered({
        session: { ccdCase: { applicantFirstName: 'John', applicantLastName: 'Smith' } },
      })
    ).toBe(true);
    expect(capturedConfig.isAnswered({ session: { ccdCase: { applicantFirstName: 'John' } } })).toBe(false);
  });
});
