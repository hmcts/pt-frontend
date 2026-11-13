import type { Request } from 'express';

import { buildTenancyDetailsRows } from '../../../../main/steps/landlord-response/your-response/review-tenancy-details/buildTenancyDetailsRows';

import type { RentDetails } from '@services/ccd/ccdCase.interface';

const CASE_REF = '1234123412341234';
const t = ((key: string) => key) as never;

const makeReq = (rentDetails?: Partial<RentDetails>, caseReference = CASE_REF, language = 'en'): Request =>
  ({
    params: { caseReference: CASE_REF },
    i18n: { language },
    session: { ccdCase: { caseReference, rentDetails } },
  }) as unknown as Request;

const rowsFor = (rentDetails?: Partial<RentDetails>, caseReference?: string, language?: string) =>
  buildTenancyDetailsRows(makeReq(rentDetails, caseReference, language), t).map(row => [
    row.key.text,
    row.value.text ?? row.value.html,
  ]);

const fullAnswers: Partial<RentDetails> = {
  tribunalPreviouslyDeterminedTenancyRent: 'No' as never,
  rentPaymentFrequency: 'monthly' as never,
  rentCostMonthly: '999' as never,
  rentIncludesCouncilTax: 'No' as never,
  rentInclusiveOfUtilityCharges: 'Yes' as never,
  utilitiesPaidFrequency: 'monthly' as never,
  utilitiesCostMonthly: '300' as never,
  currentTenancyStartDate: '2026-04-12T00:00:00',
  anyOtherHouseholdManagementCharges: 'Yes' as never,
  otherHouseholdManagementChargesDetails: 'Cleaning\n<b>Garden</b>',
  additionalRentalServiceChargesVary: 'No' as never,
};

describe('buildTenancyDetailsRows', () => {
  it('shows every answer the tenant gave, in the ticket order', () => {
    expect(rowsFor(fullAnswers)).toEqual([
      ['tenancyDetails.rows.tribunalPreviouslyDeterminedTenancyRent', 'common:no'],
      ['tenancyDetails.rows.rentPaymentFrequency', 'tenancyDetails.frequency.monthly'],
      ['tenancyDetails.rows.rentCost', '£999.00'],
      ['tenancyDetails.rows.rentIncludesCouncilTax', 'common:no'],
      ['tenancyDetails.rows.rentInclusiveOfUtilityCharges', 'common:yes'],
      ['tenancyDetails.rows.utilitiesCost', '£300.00'],
      ['tenancyDetails.rows.utilitiesPaidFrequency', 'tenancyDetails.frequency.monthly'],
      ['tenancyDetails.rows.currentTenancyStartDate', '12 April 2026'],
      ['tenancyDetails.rows.anyOtherHouseholdManagementCharges', 'common:yes'],
      ['tenancyDetails.rows.otherHouseholdManagementChargesDetails', 'Cleaning<br>&lt;b&gt;Garden&lt;/b&gt;'],
      ['tenancyDetails.rows.additionalRentalServiceChargesVary', 'common:no'],
    ]);
  });

  it('shows the amount for whichever frequency the tenant pays', () => {
    expect(rowsFor({ rentPaymentFrequency: 'weekly' as never, rentCostWeekly: '250' as never })).toEqual([
      ['tenancyDetails.rows.rentPaymentFrequency', 'tenancyDetails.frequency.weekly'],
      ['tenancyDetails.rows.rentCost', '£250.00'],
    ]);
  });

  it('shows the details typed for Other in place of the utilities frequency', () => {
    expect(
      rowsFor({
        rentInclusiveOfUtilityCharges: 'Yes' as never,
        utilitiesPaidFrequency: 'other' as never,
        utilitiesPaidFrequencyAndCostDetails: 'Quarterly, about 90 pounds',
      })
    ).toEqual([
      ['tenancyDetails.rows.rentInclusiveOfUtilityCharges', 'common:yes'],
      ['tenancyDetails.rows.utilitiesPaidFrequency', 'Quarterly, about 90 pounds'],
    ]);
  });

  it('hides answers left over from a question the tenant later answered No to', () => {
    expect(
      rowsFor({
        rentInclusiveOfUtilityCharges: 'No' as never,
        utilitiesPaidFrequency: 'monthly' as never,
        utilitiesCostMonthly: '300' as never,
        anyOtherHouseholdManagementCharges: 'No' as never,
        otherHouseholdManagementChargesDetails: 'stale',
        additionalRentalServiceChargesVary: 'Yes' as never,
      })
    ).toEqual([
      ['tenancyDetails.rows.rentInclusiveOfUtilityCharges', 'common:no'],
      ['tenancyDetails.rows.anyOtherHouseholdManagementCharges', 'common:no'],
    ]);
  });

  it('shows the start date in Welsh', () => {
    expect(rowsFor({ currentTenancyStartDate: '2026-04-12' }, CASE_REF, 'cy')).toEqual([
      ['tenancyDetails.rows.currentTenancyStartDate', '12 Ebrill 2026'],
    ]);
  });

  it('leaves out a start date that is not a real date', () => {
    const req = {
      params: { caseReference: CASE_REF },
      session: { ccdCase: { caseReference: CASE_REF, rentDetails: { currentTenancyStartDate: '2026-02-31' } } },
    } as unknown as Request;

    expect(buildTenancyDetailsRows(req, t)).toEqual([]);
  });

  it('shows nothing for a case other than the one in the address bar', () => {
    expect(rowsFor(fullAnswers, '9999999999999999')).toEqual([]);
  });

  it('shows nothing when the tenant gave no rent details', () => {
    expect(rowsFor(undefined)).toEqual([]);
  });
});
