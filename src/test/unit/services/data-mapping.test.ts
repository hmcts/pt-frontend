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
        applicantContactPreferences: {
          phoneNumberForCalls: '07777777774',
          textUpdates: 'Yes',
          textUpdatesPhoneNumber: '+447777777777',
        },
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
        applicantContactPreferences: {
          phoneNumberForCalls: '07777777774',
          textUpdates: 'No',
        },
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
        applicantContactPreferences: {
          phoneNumberForCalls: '07777766666',
          textUpdates: 'Yes',
          textUpdatesPhoneNumber: '+447777777777',
        },
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
        applicantContactPreferences: {
          phoneNumberForCalls: undefined,
          textUpdates: undefined,
          textUpdatesPhoneNumber: undefined,
        },
      });
    });
  });

  describe('theCurrentRentAndOtherCosts data mapping', () => {
    const sectionId = 'theCurrentRentAndOtherCosts';

    const reqWith = (formData: Record<string, unknown>): Request => ({ session: { formData } }) as unknown as Request;

    const currentRentDetailsFrom = (mapped: Record<string, unknown>): Record<string, unknown> =>
      (mapped as { currentRentDetails: Record<string, unknown> }).currentRentDetails;

    it('should map the section from form data', () => {
      const mockReq = reqWith({
        'tribunal-previously-determined-rent': {
          tribunalPreviouslyDeterminedTenancyRent: 'Yes',
          'tribunalPreviouslyDeterminedTenancyRent.previousTribunalCaseReference': 'LON/00AD/SMO/2023/0001',
        },
        'rent-payment-frequency': {
          rentPaymentFrequency: 'monthly',
          'rentPaymentFrequency.rentCostMonthly': '1000',
        },
        'rent-includes-council-tax': { rentIncludesCouncilTax: 'Yes' },
        'council-tax-frequency': {
          councilTaxFrequency: 'other',
          'councilTaxFrequency.councilTaxFrequencyAndCostDetails': 'Paid quarterly',
        },
        'rent-inclusive-of-utility-charges': { rentInclusiveOfUtilityCharges: 'Yes' },
        'utilities-paid-frequency': {
          utilitiesPaidFrequency: 'weekly',
          'utilitiesPaidFrequency.utilitiesPaidCostWeekly': '25.50',
        },
        'current-tenancy-start-date': { currentTenancyStartDate: { day: '1', month: '2', year: '2000' } },
        'tenancy-end-date': { currentTenancyEndDate: { day: '31', month: '12', year: '2027' } },
        'current-tenancy-replace-original-tenancy': {
          currentTenancyReplaceOriginalTenancy: 'Yes',
          'currentTenancyReplaceOriginalTenancy.originalTenancyStartDate-day': '5',
          'currentTenancyReplaceOriginalTenancy.originalTenancyStartDate-month': '6',
          'currentTenancyReplaceOriginalTenancy.originalTenancyStartDate-year': '1999',
        },
        'other-household-management-charges': { anyOtherHouseholdManagementCharges: 'Yes' },
        'other-household-management-charges-details': { otherHouseholdManagementChargesDetails: 'Maintenance' },
        'additional-rental-service-charges-vary': {
          additionalRentalServiceChargesVary: 'Yes',
          'additionalRentalServiceChargesVary.varyingAdditionalRentalServiceChargesDetails': 'They vary',
        },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);

      expect(currentRentDetailsFrom(mappedData)).toMatchObject({
        tribunalPreviouslyDeterminedTenancyRent: 'Yes',
        previousTribunalCaseReference: 'LON/00AD/SMO/2023/0001',
        rentPaymentFrequency: 'monthly',
        rentCostMonthly: 1000,
        rentIncludesCouncilTax: 'Yes',
        councilTaxFrequency: 'other',
        councilTaxFrequencyAndCostDetails: 'Paid quarterly',
        rentInclusiveOfUtilityCharges: 'Yes',
        utilitiesPaidFrequency: 'weekly',
        utilitiesPaidCostWeekly: 25.5,
        currentTenancyStartDate: '2000-02-01',
        currentTenancyEndDate: '2027-12-31',
        currentTenancyReplaceOriginalTenancy: 'Yes',
        originalTenancyStartDate: '1999-06-05',
        anyOtherHouseholdManagementCharges: 'Yes',
        otherHouseholdManagementChargesDetails: 'Maintenance',
        additionalRentalServiceChargesVary: 'Yes',
        varyingAdditionalRentalServiceChargesDetails: 'They vary',
      });
    });

    it('should fall back to the saved case and strip the time from its dates', () => {
      const ccdCaseData = {
        currentRentsDetails: {
          tribunalPreviouslyDeterminedTenancyRent: 'Yes',
          previousTribunalCaseReference: 'LON/00AD/SMO/2023/0002',
          rentPaymentFrequency: 'yearly',
          rentCostYearly: 20000,
          rentIncludesCouncilTax: 'Yes',
          councilTaxFrequency: 'weekly',
          councilTaxCostWeekly: 12,
          rentInclusiveOfUtilityCharges: 'Yes',
          utilitiesPaidFrequency: 'monthly',
          utilitiesCostMonthly: 80,
          currentTenancyStartDate: '2000-01-01T00:00:00',
          currentTenancyEndDate: '2027-01-01T00:00:00',
          currentTenancyReplaceOriginalTenancy: 'Yes',
          originalTenancyStartDate: '1999-01-01T00:00:00',
          anyOtherHouseholdManagementCharges: 'Yes',
          otherHouseholdManagementChargesDetails: 'Other charges',
          additionalRentalServiceChargesVary: 'Yes',
          varyingAdditionalRentalServiceChargesDetails: 'Charge details',
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, reqWith({}), ccdCaseData);

      expect(currentRentDetailsFrom(mappedData)).toMatchObject({
        previousTribunalCaseReference: 'LON/00AD/SMO/2023/0002',
        rentPaymentFrequency: 'yearly',
        rentCostYearly: 20000,
        councilTaxFrequency: 'weekly',
        councilTaxCostWeekly: 12,
        utilitiesPaidFrequency: 'monthly',
        utilitiesPaidCostMonthly: 80,
        currentTenancyStartDate: '2000-01-01',
        currentTenancyEndDate: '2027-01-01',
        originalTenancyStartDate: '1999-01-01',
        otherHouseholdManagementChargesDetails: 'Other charges',
        varyingAdditionalRentalServiceChargesDetails: 'Charge details',
      });
    });

    it('should prefer form data over the saved case', () => {
      const mockReq = reqWith({
        'rent-payment-frequency': {
          rentPaymentFrequency: 'weekly',
          'rentPaymentFrequency.rentCostWeekly': '150',
        },
      });

      const ccdCaseData = {
        currentRentsDetails: {
          rentPaymentFrequency: 'yearly',
          rentCostWeekly: 999,
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(currentRentDetailsFrom(mappedData)).toMatchObject({
        rentPaymentFrequency: 'weekly',
        rentCostWeekly: 150,
      });
    });

    it('should omit conditional answers when their parent answer is not Yes', () => {
      const mockReq = reqWith({
        'tribunal-previously-determined-rent': { tribunalPreviouslyDeterminedTenancyRent: 'No' },
        'rent-includes-council-tax': { rentIncludesCouncilTax: 'No' },
        'rent-inclusive-of-utility-charges': { rentInclusiveOfUtilityCharges: 'No' },
        'current-tenancy-replace-original-tenancy': { currentTenancyReplaceOriginalTenancy: 'NotSure' },
        'other-household-management-charges': { anyOtherHouseholdManagementCharges: 'No' },
      });

      const ccdCaseData = {
        currentRentsDetails: {
          previousTribunalCaseReference: 'LON/00AD/SMO/2023/0001',
          councilTaxFrequency: 'weekly',
          councilTaxCostWeekly: 12,
          councilTaxFrequencyAndCostDetails: 'Paid quarterly',
          utilitiesPaidFrequency: 'monthly',
          utilitiesCostMonthly: 80,
          utilitiesPaidFrequencyAndCostDetails: 'Paid with the rent',
          originalTenancyStartDate: '1999-01-01T00:00:00',
          otherHouseholdManagementChargesDetails: 'Other charges',
          additionalRentalServiceChargesVary: 'Yes',
          varyingAdditionalRentalServiceChargesDetails: 'Charge details',
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);
      const currentRentDetails = currentRentDetailsFrom(mappedData);

      expect(currentRentDetails.tribunalPreviouslyDeterminedTenancyRent).toBe('No');
      expect(currentRentDetails.previousTribunalCaseReference).toBeUndefined();
      expect(currentRentDetails.councilTaxFrequency).toBeUndefined();
      expect(currentRentDetails.councilTaxCostWeekly).toBeUndefined();
      expect(currentRentDetails.councilTaxFrequencyAndCostDetails).toBeUndefined();
      expect(currentRentDetails.utilitiesPaidFrequency).toBeUndefined();
      expect(currentRentDetails.utilitiesPaidCostMonthly).toBeUndefined();
      expect(currentRentDetails.utilitiesPaidFrequencyAndCostDetails).toBeUndefined();
      expect(currentRentDetails.originalTenancyStartDate).toBeUndefined();
      expect(currentRentDetails.otherHouseholdManagementChargesDetails).toBeUndefined();
      expect(currentRentDetails.additionalRentalServiceChargesVary).toBeUndefined();
      expect(currentRentDetails.varyingAdditionalRentalServiceChargesDetails).toBeUndefined();
    });

    it('should omit the varying charges details when the charges do not vary', () => {
      const mockReq = reqWith({
        'other-household-management-charges': { anyOtherHouseholdManagementCharges: 'Yes' },
        'additional-rental-service-charges-vary': {
          additionalRentalServiceChargesVary: 'No',
          'additionalRentalServiceChargesVary.varyingAdditionalRentalServiceChargesDetails': 'They vary',
        },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);
      const currentRentDetails = currentRentDetailsFrom(mappedData);

      expect(currentRentDetails.additionalRentalServiceChargesVary).toBe('No');
      expect(currentRentDetails.varyingAdditionalRentalServiceChargesDetails).toBeUndefined();
    });

    it('should leave amounts undefined when they are empty or not numeric', () => {
      const mockReq = reqWith({
        'rent-payment-frequency': {
          rentPaymentFrequency: 'weekly',
          'rentPaymentFrequency.rentCostWeekly': '',
          'rentPaymentFrequency.rentCostMonthly': 'not-a-number',
        },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);
      const currentRentDetails = currentRentDetailsFrom(mappedData);

      expect(currentRentDetails.rentCostWeekly).toBeUndefined();
      expect(currentRentDetails.rentCostMonthly).toBeUndefined();
    });

    it('should leave dates undefined when any part is missing', () => {
      const mockReq = reqWith({
        'current-tenancy-start-date': { currentTenancyStartDate: { day: '1', month: '', year: '2000' } },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);

      expect(currentRentDetailsFrom(mappedData).currentTenancyStartDate).toBeUndefined();
    });
  });
});
