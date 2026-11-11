import { Request } from 'express';

import { PTCaseData } from '@services/ccd/ccdCase.interface';
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

  describe('rentDetails data mapping for the current rent questions', () => {
    const sectionId = 'rentDetails';

    const reqWith = (formData: Record<string, unknown>): Request =>
      ({
        params: { caseReference: CASE_REF },
        session: { formData: { [CASE_REF]: formData } },
      }) as unknown as Request;

    const rentDetailsFrom = (mapped: Record<string, unknown>): Record<string, unknown> =>
      (mapped as { rentDetails: Record<string, unknown> }).rentDetails;

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

      expect(rentDetailsFrom(mappedData)).toMatchObject({
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
        caseReference: BigInt(CASE_REF),
        rentDetails: {
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

      expect(rentDetailsFrom(mappedData)).toMatchObject({
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
        caseReference: BigInt(CASE_REF),
        rentDetails: {
          rentPaymentFrequency: 'yearly',
          rentCostWeekly: 999,
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(rentDetailsFrom(mappedData)).toMatchObject({
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
        caseReference: BigInt(CASE_REF),
        rentDetails: {
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
      const rentDetails = rentDetailsFrom(mappedData);

      expect(rentDetails.tribunalPreviouslyDeterminedTenancyRent).toBe('No');
      expect(rentDetails.previousTribunalCaseReference).toBeUndefined();
      expect(rentDetails.councilTaxFrequency).toBeUndefined();
      expect(rentDetails.councilTaxCostWeekly).toBeUndefined();
      expect(rentDetails.councilTaxFrequencyAndCostDetails).toBeUndefined();
      expect(rentDetails.utilitiesPaidFrequency).toBeUndefined();
      expect(rentDetails.utilitiesPaidCostMonthly).toBeUndefined();
      expect(rentDetails.utilitiesPaidFrequencyAndCostDetails).toBeUndefined();
      expect(rentDetails.originalTenancyStartDate).toBeUndefined();
      expect(rentDetails.otherHouseholdManagementChargesDetails).toBeUndefined();
      expect(rentDetails.additionalRentalServiceChargesVary).toBeUndefined();
      expect(rentDetails.varyingAdditionalRentalServiceChargesDetails).toBeUndefined();
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
      const rentDetails = rentDetailsFrom(mappedData);

      expect(rentDetails.additionalRentalServiceChargesVary).toBe('No');
      expect(rentDetails.varyingAdditionalRentalServiceChargesDetails).toBeUndefined();
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
      const rentDetails = rentDetailsFrom(mappedData);

      expect(rentDetails.rentCostWeekly).toBeUndefined();
      expect(rentDetails.rentCostMonthly).toBeUndefined();
    });

    it('should leave dates undefined when any part is missing', () => {
      const mockReq = reqWith({
        'current-tenancy-start-date': { currentTenancyStartDate: { day: '1', month: '', year: '2000' } },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);

      expect(rentDetailsFrom(mappedData).currentTenancyStartDate).toBeUndefined();
    });
  });

  describe('rentDetails data mapping for the market rent questions', () => {
    const sectionId = 'rentDetails';

    const reqWith = (formData: Record<string, unknown>): Request =>
      ({
        params: { caseReference: CASE_REF },
        session: { formData: { [CASE_REF]: formData } },
      }) as unknown as Request;

    const rentDetailsFrom = (mapped: Record<string, unknown>): Record<string, unknown> =>
      (mapped as { rentDetails: Record<string, unknown> }).rentDetails;

    it('should save the current rent and market rent answers together', () => {
      const mockReq = reqWith({
        'rent-payment-frequency': {
          rentPaymentFrequency: 'monthly',
          'rentPaymentFrequency.rentCostMonthly': '1000',
        },
        'proposed-market-rent': {
          applicantSuggestedMarketRent: '950',
          applicantSuggestedMarketRentFrequency: 'monthly',
        },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);

      expect(rentDetailsFrom(mappedData)).toMatchObject({
        rentPaymentFrequency: 'monthly',
        rentCostMonthly: 1000,
        applicantSuggestedMarketRent: 950,
        applicantSuggestedMarketRentFrequency: 'monthly',
      });
    });

    it('should map the market rent from form data as a number', () => {
      const mockReq = reqWith({
        'proposed-market-rent': { applicantSuggestedMarketRent: '1200.50' },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);

      expect(rentDetailsFrom(mappedData)).toEqual({ applicantSuggestedMarketRent: 1200.5 });
    });

    it('should fall back to the saved case', () => {
      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        rentDetails: { applicantSuggestedMarketRent: 900 },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, reqWith({}), ccdCaseData);

      expect(rentDetailsFrom(mappedData)).toEqual({ applicantSuggestedMarketRent: 900 });
    });

    it('should prefer form data over the saved case', () => {
      const mockReq = reqWith({
        'proposed-market-rent': { applicantSuggestedMarketRent: '1500' },
      });

      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        rentDetails: { applicantSuggestedMarketRent: 900 },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(rentDetailsFrom(mappedData)).toEqual({ applicantSuggestedMarketRent: 1500 });
    });

    it('should leave the market rent undefined when it is empty or not numeric', () => {
      const empty = prepareDataForSave(
        sectionId,
        reqWith({ 'proposed-market-rent': { applicantSuggestedMarketRent: '' } }),
        {} as unknown as PTCaseData
      );
      const notANumber = prepareDataForSave(
        sectionId,
        reqWith({ 'proposed-market-rent': { applicantSuggestedMarketRent: 'not-a-number' } }),
        {} as unknown as PTCaseData
      );

      expect(rentDetailsFrom(empty).applicantSuggestedMarketRent).toBeUndefined();
      expect(rentDetailsFrom(notANumber).applicantSuggestedMarketRent).toBeUndefined();
    });

    it('should map the frequency and the other details when other is selected', () => {
      const mockReq = reqWith({
        'proposed-market-rent': {
          applicantSuggestedMarketRentFrequency: 'other',
          'applicantSuggestedMarketRentFrequency.applicantSuggestedMarketRentFrequencyOther': 'Every 4 weeks',
        },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);

      expect(rentDetailsFrom(mappedData)).toEqual({
        applicantSuggestedMarketRentFrequency: 'other',
        applicantSuggestedMarketRentFrequencyOther: 'Every 4 weeks',
      });
    });

    it('should leave out saved other details when a different frequency is selected', () => {
      const mockReq = reqWith({
        'proposed-market-rent': { applicantSuggestedMarketRentFrequency: 'monthly' },
      });

      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        rentDetails: {
          applicantSuggestedMarketRentFrequency: 'other',
          applicantSuggestedMarketRentFrequencyOther: 'Every 4 weeks',
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(rentDetailsFrom(mappedData).applicantSuggestedMarketRentFrequency).toBe('monthly');
      expect(rentDetailsFrom(mappedData).applicantSuggestedMarketRentFrequencyOther).toBeUndefined();
    });
  });

  describe('yourTenancyAgreement data mapping', () => {
    it('should correctly map data when values are present in the form data', () => {
      const mockReq = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'have-tenancy-agreement': {
                copyOfTenancyAgreement: 'No',
                'copyOfTenancyAgreement.noTenancyAgreementReason': 'I never received one',
              },
            },
          },
        },
      } as unknown as Request;

      const mappedData = prepareDataForSave('yourTenancyAgreement', mockReq, {} as unknown as PTCaseData);

      expect(mappedData).toEqual({
        tenancyAgreementDetails: {
          copyOfTenancyAgreement: 'No',
          noTenancyAgreementReason: 'I never received one',
        },
      });
    });

    it('should clear noTenancyAgreementReason when answered Yes', () => {
      const mockReq = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'have-tenancy-agreement': {
                copyOfTenancyAgreement: 'Yes',
                'copyOfTenancyAgreement.noTenancyAgreementReason': 'stale reason',
              },
            },
          },
        },
      } as unknown as Request;

      const mappedData = prepareDataForSave('yourTenancyAgreement', mockReq, {} as unknown as PTCaseData);

      expect(mappedData).toEqual({
        tenancyAgreementDetails: {
          copyOfTenancyAgreement: 'Yes',
          noTenancyAgreementReason: undefined,
        },
      });
    });

    it('should fall back to saved case data when form data is not present', () => {
      const mockReq = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'have-tenancy-agreement': {},
            },
          },
        },
      } as unknown as Request;

      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        tenancyAgreementDetails: {
          copyOfTenancyAgreement: 'No',
          noTenancyAgreementReason: 'Lost the agreement',
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave('yourTenancyAgreement', mockReq, ccdCaseData);

      expect(mappedData).toEqual({
        tenancyAgreementDetails: {
          copyOfTenancyAgreement: 'No',
          noTenancyAgreementReason: 'Lost the agreement',
        },
      });
    });
  });

  describe('propertyInspection data mapping', () => {
    it('should map both answers', () => {
      const mockReq = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'property-inspection': {
                agreeToDecisionWithoutInspection: 'No',
                'agreeToDecisionWithoutInspection.noDecisionWithoutInspectionReason': 'Damp in the bedroom',
              },
              hearing: {
                hearingRequested: 'Yes',
                'hearingRequested.reasonHearingRequested': 'I want to attend',
              },
            },
          },
        },
      } as unknown as Request;

      const mappedData = prepareDataForSave('propertyInspection', mockReq, {} as unknown as PTCaseData);

      expect(mappedData).toEqual({
        hearingInspectionDetails: {
          agreeToDecisionWithoutInspection: 'No',
          noDecisionWithoutInspectionReason: 'Damp in the bedroom',
          hearingRequested: 'Yes',
          reasonHearingRequested: 'I want to attend',
        },
      });
    });

    it('should clear both reasons when no inspection or hearing is needed', () => {
      const mockReq = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'property-inspection': {
                agreeToDecisionWithoutInspection: 'Yes',
                'agreeToDecisionWithoutInspection.noDecisionWithoutInspectionReason': 'stale reason',
              },
              hearing: {
                hearingRequested: 'No',
                'hearingRequested.reasonHearingRequested': 'stale reason',
              },
            },
          },
        },
      } as unknown as Request;

      const mappedData = prepareDataForSave('propertyInspection', mockReq, {} as unknown as PTCaseData);

      expect(mappedData).toEqual({
        hearingInspectionDetails: {
          agreeToDecisionWithoutInspection: 'Yes',
          noDecisionWithoutInspectionReason: undefined,
          hearingRequested: 'No',
          reasonHearingRequested: undefined,
        },
      });
    });

    it('should fall back to saved case data when form data is not present', () => {
      const mockReq = {
        params: { caseReference: CASE_REF },
        session: { formData: { [CASE_REF]: {} } },
      } as unknown as Request;

      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        hearingInspectionDetails: {
          agreeToDecisionWithoutInspection: 'No',
          noDecisionWithoutInspectionReason: 'Damp in the bedroom',
          hearingRequested: 'Yes',
          reasonHearingRequested: 'I want to attend',
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave('propertyInspection', mockReq, ccdCaseData);

      expect(mappedData).toEqual({
        hearingInspectionDetails: {
          agreeToDecisionWithoutInspection: 'No',
          noDecisionWithoutInspectionReason: 'Damp in the bedroom',
          hearingRequested: 'Yes',
          reasonHearingRequested: 'I want to attend',
        },
      });
    });
  });

  describe('propertyDetails data mapping', () => {
    const sectionId = 'propertyDetails';

    const reqWith = (formData: Record<string, unknown>): Request =>
      ({
        params: { caseReference: CASE_REF },
        session: { formData: { [CASE_REF]: formData } },
      }) as unknown as Request;

    const propertyDetailsFrom = (mapped: Record<string, unknown>): Record<string, unknown> =>
      (mapped as { propertyDetails: Record<string, unknown> }).propertyDetails;

    it('should map property details from form data', () => {
      const mockReq = reqWith({
        '': {
          addressLine1: '10 High Street',
          addressLine2: 'Flat 2',
          townOrCity: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
        },
        'what-are-you-renting': {
          propertyType: 'roomOrRooms',
          'propertyType.roomOrRoomsDescription': 'A furnished bedroom',
        },
        'floor-plan-of-property': {
          propertyFloorPlanAvailable: 'No',
          'propertyFloorPlanAvailable.propertyLayoutDescription': 'Two bedrooms and a shared kitchen',
        },
        'indoor-features': {
          indoorFeatures: 'Central heating, double glazing',
        },
        'does-the-tenancy-include-other-facilities': {
          propertyIncludesOtherFacilities: 'Yes',
          'propertyIncludesOtherFacilities.propertyFacilitiesDescription': 'Garden and parking',
        },
        'do-you-share-the-property-with-landlord': {
          propertySharedWithLandlord: 'Yes',
          'propertySharedWithLandlord.propertySharedWithLandlordDetails': 'The landlord lives upstairs',
        },
        'furniture-provided-tenancy': {
          furnitureProvided: 'Yes',
          'furnitureProvided.furnitureProvidedDetails': 'Bed, wardrobe and desk',
        },
        'services-provided-tenancy': {
          servicesProvided: 'Yes',
          'servicesProvided.servicesProvidedDetails': 'Weekly cleaning',
        },
        'what-reairs-landlord-responsibility': {
          landlordRepairsDetails: 'Roof and boiler repairs',
          tenantRepairDetails: 'Minor internal repairs',
        },
        'repairs-and-improvments': {
          hasRepairsAndImprovements: 'Yes',
        },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);

      expect(propertyDetailsFrom(mappedData)).toEqual({
        addressLine1: '10 High Street',
        addressLine2: 'Flat 2',
        postTown: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA',
        propertyType: 'roomOrRooms',
        rentingRoomDetails: 'A furnished bedroom',
        rentingFlatDetails: undefined,
        otherMethodRentingDetails: undefined,
        propertyFloorPlanAvailable: 'No',
        floorPlanManualDetails: 'Two bedrooms and a shared kitchen',
        indoorFeatures: 'Central heating, double glazing',
        otherFacilitiesAvailable: 'Yes',
        otherFacilitiesDetails: 'Garden and parking',
        sharePropertyWithLandlord: 'Yes',
        sharePropertyWithLandlordDetails: 'The landlord lives upstairs',
        furnitureProvidedInTenancy: 'Yes',
        furnitureProvidedInTenancyDetails: 'Bed, wardrobe and desk',
        servicesProvidedInTenancy: 'Yes',
        servicesProvidedInTenancyDetails: 'Weekly cleaning',
        landlordRepairsDetails: 'Roof and boiler repairs',
        tenantRepairDetails: 'Minor internal repairs',
        anyTenantsMadePropertyRepairs: 'Yes',
      });
    });

    it('should fall back to saved case data when form data is not present', () => {
      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        propertyDetails: {
          addressLine1: '20 High Street',
          addressLine2: 'Apartment 3',
          postTown: 'Manchester',
          county: 'Lancashire',
          postcode: 'M1 1AA',
          propertyType: 'flat',
          rentingFlatDetails: 'Second floor',
          propertyFloorPlanAvailable: 'No',
          floorPlanManualDetails: 'Two bedrooms and one bathroom',
          indoorFeatures: 'Double glazing',
          otherFacilitiesAvailable: 'Yes',
          otherFacilitiesDetails: 'Communal garden',
          sharePropertyWithLandlord: 'Yes',
          sharePropertyWithLandlordDetails: 'Landlord occupies the ground floor',
          furnitureProvidedInTenancy: 'Yes',
          furnitureProvidedInTenancyDetails: 'Fully furnished',
          additionalServicesProvidedInTenancy: 'Yes',
          additionalServicesProvidedInTenancyDetails: 'Cleaning service',
          landlordRepairsDetails: 'Structural repairs',
          tenantRepairsDetails: 'Minor repairs',
          anyTenantsMadePropertyRepairs: 'Yes',
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, reqWith({}), ccdCaseData);

      expect(propertyDetailsFrom(mappedData)).toEqual({
        addressLine1: '20 High Street',
        addressLine2: 'Apartment 3',
        postTown: 'Manchester',
        county: 'Lancashire',
        postcode: 'M1 1AA',
        propertyType: 'flat',
        rentingRoomDetails: undefined,
        rentingFlatDetails: 'Second floor',
        otherMethodRentingDetails: undefined,
        propertyFloorPlanAvailable: 'No',
        floorPlanManualDetails: 'Two bedrooms and one bathroom',
        indoorFeatures: 'Double glazing',
        otherFacilitiesAvailable: 'Yes',
        otherFacilitiesDetails: 'Communal garden',
        sharePropertyWithLandlord: 'Yes',
        sharePropertyWithLandlordDetails: 'Landlord occupies the ground floor',
        furnitureProvidedInTenancy: 'Yes',
        furnitureProvidedInTenancyDetails: 'Fully furnished',
        servicesProvidedInTenancy: 'Yes',
        servicesProvidedInTenancyDetails: 'Cleaning service',
        landlordRepairsDetails: 'Structural repairs',
        tenantRepairDetails: 'Minor repairs',
        anyTenantsMadePropertyRepairs: 'Yes',
      });
    });

    it('should prefer form data over saved case data', () => {
      const mockReq = reqWith({
        'what-are-you-renting': {
          propertyType: 'flat',
          'propertyType.flatFloor': 'Third floor',
        },
        'indoor-features': {
          indoorFeatures: 'Central heating',
        },
      });

      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        propertyDetails: {
          propertyType: 'roomOrRooms',
          rentingRoomDetails: 'Old room description',
          rentingFlatDetails: 'First floor',
          indoorFeatures: 'Electric heating',
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(propertyDetailsFrom(mappedData)).toMatchObject({
        propertyType: 'flat',
        rentingFlatDetails: 'Third floor',
        indoorFeatures: 'Central heating',
      });

      expect(propertyDetailsFrom(mappedData).rentingRoomDetails).toBeUndefined();
    });

    it('should map flat details when flat is selected', () => {
      const mockReq = reqWith({
        'what-are-you-renting': {
          propertyType: 'flat',
          'propertyType.flatFloor': 'Second floor',
          'propertyType.roomOrRoomsDescription': 'Stale room description',
          'propertyType.otherDescription': 'Stale other description',
        },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);

      expect(propertyDetailsFrom(mappedData)).toMatchObject({
        propertyType: 'flat',
        rentingFlatDetails: 'Second floor',
      });

      expect(propertyDetailsFrom(mappedData).rentingRoomDetails).toBeUndefined();
      expect(propertyDetailsFrom(mappedData).otherMethodRentingDetails).toBeUndefined();
    });

    it('should map other property type details when other is selected', () => {
      const mockReq = reqWith({
        'what-are-you-renting': {
          propertyType: 'other',
          'propertyType.otherDescription': 'A converted warehouse',
        },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);

      expect(propertyDetailsFrom(mappedData)).toMatchObject({
        propertyType: 'other',
        otherMethodRentingDetails: 'A converted warehouse',
      });

      expect(propertyDetailsFrom(mappedData).rentingRoomDetails).toBeUndefined();
      expect(propertyDetailsFrom(mappedData).rentingFlatDetails).toBeUndefined();
    });

    it('should clear property type descriptions when a different property type is selected', () => {
      const mockReq = reqWith({
        'what-are-you-renting': {
          propertyType: 'other',
          'propertyType.otherDescription': 'A converted warehouse',
        },
      });

      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        propertyDetails: {
          propertyType: 'roomOrRooms',
          rentingRoomDetails: 'Old room description',
          rentingFlatDetails: 'Old floor description',
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);
      const propertyDetails = propertyDetailsFrom(mappedData);

      expect(propertyDetails.otherMethodRentingDetails).toBe('A converted warehouse');
      expect(propertyDetails.rentingRoomDetails).toBeUndefined();
      expect(propertyDetails.rentingFlatDetails).toBeUndefined();
    });

    it('should clear floor plan details when a floor plan is available', () => {
      const mockReq = reqWith({
        'floor-plan-of-property': {
          propertyFloorPlanAvailable: 'Yes',
          'propertyFloorPlanAvailable.propertyLayoutDescription': 'Stale layout description',
        },
      });

      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        propertyDetails: {
          propertyFloorPlanAvailable: 'No',
          floorPlanManualDetails: 'Old layout description',
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);
      const propertyDetails = propertyDetailsFrom(mappedData);

      expect(propertyDetails.propertyFloorPlanAvailable).toBe('Yes');
      expect(propertyDetails.floorPlanManualDetails).toBeUndefined();
    });

    it('should map floor plan description when no floor plan is available', () => {
      const mockReq = reqWith({
        'floor-plan-of-property': {
          propertyFloorPlanAvailable: 'No',
          'propertyFloorPlanAvailable.propertyLayoutDescription': 'A kitchen, lounge and two bedrooms',
        },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);

      expect(propertyDetailsFrom(mappedData)).toMatchObject({
        propertyFloorPlanAvailable: 'No',
        floorPlanManualDetails: 'A kitchen, lounge and two bedrooms',
      });
    });

    it('should clear conditional property details when the answer is No', () => {
      const mockReq = reqWith({
        'does-the-tenancy-include-other-facilities': {
          propertyIncludesOtherFacilities: 'No',
          'propertyIncludesOtherFacilities.propertyFacilitiesDescription': 'Stale facilities',
        },
        'do-you-share-the-property-with-landlord': {
          propertySharedWithLandlord: 'No',
          'propertySharedWithLandlord.propertySharedWithLandlordDetails': 'Stale sharing details',
        },
        'furniture-provided-tenancy': {
          furnitureProvided: 'No',
          'furnitureProvided.furnitureProvidedDetails': 'Stale furniture details',
        },
        'services-provided-tenancy': {
          servicesProvided: 'No',
          'servicesProvided.servicesProvidedDetails': 'Stale services details',
        },
      });

      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        propertyDetails: {
          otherFacilitiesAvailable: 'Yes',
          propertyFacilitiesDescription: 'Old facilities',
          sharePropertyWithLandlord: 'Yes',
          sharePropertyWithLandlordDetails: 'Old sharing details',
          furnitureProvidedInTenancy: 'Yes',
          furnitureProvidedInTenancyDetails: 'Old furniture',
          additionalServicesProvidedInTenancy: 'Yes',
          additionalServicesProvidedInTenancyDetails: 'Old services',
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);
      const propertyDetails = propertyDetailsFrom(mappedData);

      expect(propertyDetails.otherFacilitiesAvailable).toBe('No');
      expect(propertyDetails.otherFacilitiesDetails).toBeUndefined();

      expect(propertyDetails.sharePropertyWithLandlord).toBe('No');
      expect(propertyDetails.sharePropertyWithLandlordDetails).toBeUndefined();

      expect(propertyDetails.furnitureProvidedInTenancy).toBe('No');
      expect(propertyDetails.furnitureProvidedInTenancyDetails).toBeUndefined();

      expect(propertyDetails.servicesProvidedInTenancy).toBe('No');
      expect(propertyDetails.servicesProvidedInTenancyDetails).toBeUndefined();
    });

    it('should retain conditional details from saved case data when the answer is Yes', () => {
      const mockReq = reqWith({
        'does-the-tenancy-include-other-facilities': {
          propertyFloorPlanAvailable: 'Yes',
        },
        'do-you-share-the-property-with-landlord': {
          propertySharedWithLandlord: 'Yes',
        },
        'furniture-provided-tenancy': {
          furnitureProvided: 'Yes',
        },
        'services-provided-tenancy': {
          servicesProvided: 'Yes',
        },
      });

      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        propertyDetails: {
          otherFacilitiesAvailable: 'Yes',
          otherFacilitiesDetails: 'Parking and garden',
          sharePropertyWithLandlord: 'Yes',
          sharePropertyWithLandlordDetails: 'Landlord lives upstairs',
          furnitureProvidedInTenancy: 'Yes',
          furnitureProvidedInTenancyDetails: 'Bed and wardrobe',
          additionalServicesProvidedInTenancy: 'Yes',
          additionalServicesProvidedInTenancyDetails: 'Weekly cleaning',
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, mockReq, ccdCaseData);

      expect(propertyDetailsFrom(mappedData)).toMatchObject({
        otherFacilitiesDetails: 'Parking and garden',
        sharePropertyWithLandlordDetails: 'Landlord lives upstairs',
        furnitureProvidedInTenancyDetails: 'Bed and wardrobe',
        servicesProvidedInTenancyDetails: 'Weekly cleaning',
      });
    });

    it('should map Yes and No string values for conditional property answers', () => {
      const mockReq = reqWith({
        'floor-plan-of-property': {
          propertyFloorPlanAvailable: 'No',
          'propertyFloorPlanAvailable.propertyLayoutDescription': 'Layout details',
        },
        'does-the-tenancy-include-other-facilities': {
          propertyIncludesOtherFacilities: 'Yes',
          'propertyIncludesOtherFacilities.propertyFacilitiesDescription': 'Garden',
        },
        'do-you-share-the-property-with-landlord': {
          propertySharedWithLandlord: 'Yes',
          'propertySharedWithLandlord.propertySharedWithLandlordDetails': 'Landlord lives here',
        },
        'furniture-provided-tenancy': {
          furnitureProvided: 'Yes',
          'furnitureProvided.furnitureProvidedDetails': 'Furnished',
        },
        'services-provided-tenancy': {
          servicesProvided: 'Yes',
          'servicesProvided.servicesProvidedDetails': 'Cleaning',
        },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);

      expect(propertyDetailsFrom(mappedData)).toMatchObject({
        propertyFloorPlanAvailable: 'No',
        floorPlanManualDetails: 'Layout details',
        otherFacilitiesAvailable: 'Yes',
        otherFacilitiesDetails: 'Garden',
        sharePropertyWithLandlord: 'Yes',
        sharePropertyWithLandlordDetails: 'Landlord lives here',
        furnitureProvidedInTenancy: 'Yes',
        furnitureProvidedInTenancyDetails: 'Furnished',
        servicesProvidedInTenancy: 'Yes',
        servicesProvidedInTenancyDetails: 'Cleaning',
      });
    });

    it('should map landlord and tenant repair details', () => {
      const mockReq = reqWith({
        'what-reairs-landlord-responsibility': {
          landlordRepairsDetails: 'Structural repairs',
          tenantRepairDetails: 'Replacing light bulbs',
        },
        'repairs-and-improvments': {
          hasRepairsAndImprovements: 'Yes',
        },
      });

      const mappedData = prepareDataForSave(sectionId, mockReq, {} as unknown as PTCaseData);

      expect(propertyDetailsFrom(mappedData)).toMatchObject({
        landlordRepairsDetails: 'Structural repairs',
        tenantRepairDetails: 'Replacing light bulbs',
        anyTenantsMadePropertyRepairs: 'Yes',
      });
    });

    it('should fall back to saved repair details when form data is missing', () => {
      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        propertyDetails: {
          landlordRepairsDetails: 'Boiler maintenance',
          tenantRepairsDetails: 'Internal decoration',
          anyTenantsMadePropertyRepairs: 'No',
        },
      } as unknown as PTCaseData;

      const mappedData = prepareDataForSave(sectionId, reqWith({}), ccdCaseData);

      expect(propertyDetailsFrom(mappedData)).toMatchObject({
        landlordRepairsDetails: 'Boiler maintenance',
        tenantRepairDetails: 'Internal decoration',
        anyTenantsMadePropertyRepairs: 'No',
      });
    });

    it('should return undefined values when neither form data nor saved case data is present', () => {
      const mappedData = prepareDataForSave(sectionId, reqWith({}), {} as unknown as PTCaseData);

      expect(propertyDetailsFrom(mappedData)).toEqual({
        addressLine1: undefined,
        addressLine2: undefined,
        postTown: undefined,
        county: undefined,
        postcode: undefined,
        propertyType: undefined,
        rentingRoomDetails: undefined,
        rentingFlatDetails: undefined,
        otherMethodRentingDetails: undefined,
        propertyFloorPlanAvailable: undefined,
        floorPlanManualDetails: undefined,
        indoorFeatures: undefined,
        otherFacilitiesAvailable: undefined,
        otherFacilitiesDetails: undefined,
        sharePropertyWithLandlord: undefined,
        sharePropertyWithLandlordDetails: undefined,
        furnitureProvidedInTenancy: undefined,
        furnitureProvidedInTenancyDetails: undefined,
        servicesProvidedInTenancy: undefined,
        servicesProvidedInTenancyDetails: undefined,
        landlordRepairsDetails: undefined,
        tenantRepairDetails: undefined,
        anyTenantsMadePropertyRepairs: undefined,
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

  describe('whoIsOnTheTenancy data mapping', () => {
    it('maps personal information form data for save', () => {
      const mockReq = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'your-information': {
                applicantFirstName: 'John',
                applicantLastName: 'Smith',
                companyName: 'Smith Company',
                referenceNumberForCommunications: 'AB123',
              },
            },
          },
        },
      } as unknown as Request;

      expect(prepareDataForSave('whoIsOnTheTenancy', mockReq, {} as unknown as PTCaseData)).toEqual({
        applicantFirstName: 'John',
        applicantLastName: 'Smith',
        tenantDetails: {
          companyName: 'Smith Company',
          referenceNumberForCommunications: 'AB123',
        },
      });
    });

    it('falls back to saved case data when form fields are missing', () => {
      const mockReq = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'your-information': {
                applicantFirstName: 'Amended',
              },
            },
          },
        },
      } as unknown as Request;

      const ccdCaseData = {
        caseReference: BigInt(CASE_REF),
        applicantFirstName: 'John',
        applicantLastName: 'Smith',
        tenantDetails: {
          companyName: 'Smith Company',
          referenceNumberForCommunications: 'AB123',
        },
      } as unknown as PTCaseData;

      expect(prepareDataForSave('whoIsOnTheTenancy', mockReq, ccdCaseData)).toEqual({
        applicantFirstName: 'Amended',
        applicantLastName: 'Smith',
        tenantDetails: {
          companyName: 'Smith Company',
          referenceNumberForCommunications: 'AB123',
        },
      });
    });
  });
});
