import { Request } from 'express';

import { PTCaseData } from '@services/ccdCase.interface';
import { prepareDataForSave } from '@services/data-mapping';

const CASE_REF = '1234123412341234';

describe('prepareDataForSave', () => {
  describe('contactPreferences data mapping', () => {
    it('should correctly map data for contact preferences section when values are present in the form data', () => {
      const mockReq = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'text-updates': {
                textUpdates: 'Yes',
                'textUpdates.textUpdatesPhoneNumber': '+447777777777',
              },
              'contact-by-phone': {
                phoneNumberForCalls: '07777777774',
              },
            },
          },
        },
      } as unknown as Request;

      const ccdCaseData = {} as unknown as PTCaseData;

      const sectionId = 'contactPreferences';

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(mappedData).toEqual({
        applicantContactPreferences: {
          phoneNumberForCalls: '07777777774',
          textUpdates: 'Yes',
          textUpdatesPhoneNumber: '+447777777777',
        },
      });
    });
    it('should correctly map data for contact preferences section based on ccd case data values where form data not present', () => {
      const mockReq = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'text-updates': {
                textUpdates: 'No',
                'textUpdates.textUpdatesPhoneNumber': '',
              },
            },
          },
        },
      } as unknown as Request;

      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        applicantContactPreferences: {
          contactByText: 'Yes',
          mobilePhoneNumber: '+447777777222',
          phoneNumber: '07777777774',
        },
      } as unknown as PTCaseData;

      const sectionId = 'contactPreferences';

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(mappedData).toEqual({
        applicantContactPreferences: {
          phoneNumberForCalls: '07777777774',
          textUpdates: 'No',
        },
      });
    });
    it('should correctly map data for text updates when previously answered as no', () => {
      const mockReq = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'text-updates': {
                textUpdates: 'Yes',
                'textUpdates.textUpdatesPhoneNumber': '+447777777777',
              },
              'contact-by-phone': {
                phoneNumberForCalls: '07777766666',
              },
            },
          },
        },
      } as unknown as Request;

      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        applicantContactPreferences: {
          contactByText: 'No',
          mobilePhoneNumber: null,
          phoneNumber: '07777777774',
        },
      } as unknown as PTCaseData;

      const sectionId = 'contactPreferences';

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(mappedData).toEqual({
        applicantContactPreferences: {
          phoneNumberForCalls: '07777766666',
          textUpdates: 'Yes',
          textUpdatesPhoneNumber: '+447777777777',
        },
      });
    });
    it('should appropriately map the data if nothing present in form data or case data', () => {
      const mockReq = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'text-updates': {
                textUpdates: undefined,
                'textUpdates.textUpdatesPhoneNumber': undefined,
              },
              'contact-by-phone': {
                phoneNumberForCalls: undefined,
              },
            },
          },
        },
      } as unknown as Request;

      const ccdCaseData = {} as unknown as PTCaseData;

      const sectionId = 'contactPreferences';

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(mappedData).toEqual({
        applicantContactPreferences: {
          phoneNumberForCalls: undefined,
          textUpdates: undefined,
          textUpdatesPhoneNumber: undefined,
        },
      });
    });
  });
  describe('case scoping', () => {
    const OTHER_CASE = '9999999999999999';

    const reqFor = (caseReference: string, formData: Record<string, unknown>) =>
      ({ params: { caseReference }, session: { formData } }) as unknown as Request;

    const savedFor = (caseReference: string) =>
      ({
        caseReference: BigInt(caseReference),
        applicantContactPreferences: {
          contactByText: 'Yes',
          mobilePhoneNumber: '+447777777222',
          phoneNumber: '07777777774',
        },
      }) as unknown as PTCaseData;

    it('reads only the routed case answers when the session holds several cases', () => {
      const req = reqFor(OTHER_CASE, {
        [CASE_REF]: {
          'text-updates': { textUpdates: 'Yes', 'textUpdates.textUpdatesPhoneNumber': '+447000000001' },
          'contact-by-phone': { phoneNumberForCalls: '07000000001' },
        },
        [OTHER_CASE]: { 'contact-by-phone': { phoneNumberForCalls: '07000000002' } },
      });

      expect(prepareDataForSave('contactPreferences', req, undefined)).toEqual({
        applicantContactPreferences: {
          textUpdates: undefined,
          textUpdatesPhoneNumber: undefined,
          phoneNumberForCalls: '07000000002',
        },
      });
    });

    it('ignores saved data belonging to a different case rather than writing it to this one', () => {
      const req = reqFor(OTHER_CASE, { [OTHER_CASE]: {} });

      expect(prepareDataForSave('contactPreferences', req, savedFor(CASE_REF))).toEqual({
        applicantContactPreferences: {
          textUpdates: undefined,
          textUpdatesPhoneNumber: undefined,
          phoneNumberForCalls: undefined,
        },
      });
    });

    it('uses saved data when it does belong to the routed case', () => {
      const req = reqFor(OTHER_CASE, { [OTHER_CASE]: {} });

      expect(prepareDataForSave('contactPreferences', req, savedFor(OTHER_CASE))).toEqual({
        applicantContactPreferences: {
          textUpdates: 'Yes',
          textUpdatesPhoneNumber: '+447777777222',
          phoneNumberForCalls: '07777777774',
        },
      });
    });

    it('ignores saved data that carries no case reference', () => {
      const req = reqFor(CASE_REF, { [CASE_REF]: {} });
      const noReference = { applicantContactPreferences: { phoneNumber: '07777777774' } } as unknown as PTCaseData;

      expect(prepareDataForSave('contactPreferences', req, noReference)).toEqual({
        applicantContactPreferences: {
          textUpdates: undefined,
          textUpdatesPhoneNumber: undefined,
          phoneNumberForCalls: undefined,
        },
      });
    });

    it('ignores saved data when the route has no valid case reference', () => {
      const req = { params: {}, session: { formData: {} } } as unknown as Request;

      expect(prepareDataForSave('contactPreferences', req, savedFor(CASE_REF))).toEqual({
        applicantContactPreferences: {
          textUpdates: undefined,
          textUpdatesPhoneNumber: undefined,
          phoneNumberForCalls: undefined,
        },
      });
    });

    it('does not pick up a same-named field written by an unrelated step', () => {
      const req = reqFor(CASE_REF, {
        [CASE_REF]: { 'some-other-step': { phoneNumberForCalls: '07999999999' } },
      });

      expect(prepareDataForSave('contactPreferences', req, undefined)).toEqual({
        applicantContactPreferences: {
          textUpdates: undefined,
          textUpdatesPhoneNumber: undefined,
          phoneNumberForCalls: undefined,
        },
      });
    });
  });
});
