import { Request } from 'express';

import { PTCaseData } from '@services/ccdCase.interface';
import { prepareDataForSave } from '@services/data-mapping';

describe('prepareDataForSave', () => {
  describe('contactPreferences data mapping', () => {
    it('should correctly map data for contact preferences section when values are present in the form data', () => {
      const mockReq = {
        session: {
          formData: {
            'text-updates': {
              textUpdates: 'Yes',
              'textUpdates.textUpdatesPhoneNumber': '+447777777777',
            },
            'contact-by-phone': {
              phoneNumberForCalls: '07777777774',
            },
          },
        },
      } as unknown as Request;

      const ccdCaseData = {} as unknown as PTCaseData;

      const sectionId = 'contactPreferences';

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(mappedData).toEqual({
        applicantContactPreferencesPhoneNumberForCalls: '07777777774',
        applicantContactPreferencesTextUpdates: 'Yes',
        applicantContactPreferencesTextUpdatesPhoneNumber: '+447777777777',
      });
    });
    it('should correctly map data for contact preferences section based on ccd case data values where form data not present', () => {
      const mockReq = {
        session: {
          formData: {
            'text-updates': {
              textUpdates: 'No',
              'textUpdates.textUpdatesPhoneNumber': '',
            },
          },
        },
      } as unknown as Request;

      const ccdCaseData = {
        applicantContactPreferences: {
          contactByText: 'Yes',
          mobilePhoneNumber: '+447777777222',
          phoneNumber: '07777777774',
        },
      } as unknown as PTCaseData;

      const sectionId = 'contactPreferences';

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(mappedData).toEqual({
        applicantContactPreferencesPhoneNumberForCalls: '07777777774',
        applicantContactPreferencesTextUpdates: 'No',
        applicantContactPreferencesTextUpdatesPhoneNumber: undefined,
      });
    });
    it('should correctly map data for text updates when previously answered as no', () => {
      const mockReq = {
        session: {
          formData: {
            'text-updates': {
              textUpdates: 'Yes',
              'textUpdates.textUpdatesPhoneNumber': '+447777777777',
            },
            'contact-by-phone': {
              phoneNumberForCalls: '07777766666',
            },
          },
        },
      } as unknown as Request;

      const ccdCaseData = {
        applicantContactPreferences: {
          contactByText: 'No',
          mobilePhoneNumber: null,
          phoneNumber: '07777777774',
        },
      } as unknown as PTCaseData;

      const sectionId = 'contactPreferences';

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(mappedData).toEqual({
        applicantContactPreferencesPhoneNumberForCalls: '07777766666',
        applicantContactPreferencesTextUpdates: 'Yes',
        applicantContactPreferencesTextUpdatesPhoneNumber: '+447777777777',
      });
    });
    it('should appropriately map the data if nothing present in form data or case data', () => {
      const mockReq = {
        session: {
          formData: {
            'text-updates': {
              textUpdates: undefined,
              'textUpdates.textUpdatesPhoneNumber': undefined,
            },
            'contact-by-phone': {
              phoneNumberForCalls: undefined,
            },
          },
        },
      } as unknown as Request;

      const ccdCaseData = {} as unknown as PTCaseData;

      const sectionId = 'contactPreferences';

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(mappedData).toEqual({
        applicantContactPreferencesPhoneNumberForCalls: undefined,
        applicantContactPreferencesTextUpdates: undefined,
        applicantContactPreferencesTextUpdatesPhoneNumber: undefined,
      });
    });
  });
});
