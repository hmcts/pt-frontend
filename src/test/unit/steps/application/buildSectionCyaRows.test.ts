import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { buildSectionCyaRows } from '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/check-your-answers-current-rent-and-other-costs/buildSectionCyaRows';
// Print the key back so assertions read as the key that was looked up
const t = ((key: string) => key) as unknown as TFunction;

type Row = { key: { text: string }; value: { text?: string; html?: string } };

const CASE_REF = '1234123412341234';

const buildReq = (
  formData: Record<string, unknown> = {},
  currentRentsDetails: Record<string, unknown> = {},
  lang = 'en'
): Request =>
  ({
    params: { caseReference: CASE_REF },
    session: {
      formData: { [CASE_REF]: formData },
      ccdCase: { caseReference: CASE_REF, currentRentsDetails },
    },
    i18n: { language: lang },
  }) as unknown as Request;

const keysOf = (rows: Row[]): string[] => rows.map(row => row.key.text);

const valueOf = (rows: Row[], key: string): string | undefined => {
  const row = rows.find(r => r.key.text === key);
  return row?.value.text ?? row?.value.html;
};

describe('buildSectionCyaRows for the current rent and other costs', () => {
  it('returns no rows when the route has no case reference', () => {
    const req = { session: {} } as unknown as Request;

    expect(buildSectionCyaRows(req, t)).toEqual([]);
  });

  it('returns no rows when nothing has been answered', () => {
    expect(buildSectionCyaRows(buildReq(), t)).toEqual([]);
  });

  it('builds a row for each answered question, in journey order', () => {
    const rows = buildSectionCyaRows(
      buildReq({
        'tribunal-previously-determined-rent': {
          tribunalPreviouslyDeterminedTenancyRent: 'Yes',
          'tribunalPreviouslyDeterminedTenancyRent.previousTribunalCaseReference': 'LON/00AD/SMO/2023/0001',
        },
        'rent-payment-frequency': {
          rentPaymentFrequency: 'monthly',
          'rentPaymentFrequency.rentCostMonthly': '1000',
        },
        'rent-includes-council-tax': { rentIncludesCouncilTax: 'No' },
        'rent-inclusive-of-utility-charges': { rentInclusiveOfUtilityCharges: 'No' },
        'current-tenancy-start-date': { currentTenancyStartDate: { day: '1', month: '2', year: '2000' } },
        'tenancy-end-date': { currentTenancyEndDate: { day: '31', month: '12', year: '2027' } },
        'current-tenancy-replace-original-tenancy': { currentTenancyReplaceOriginalTenancy: 'No' },
        'other-household-management-charges': { anyOtherHouseholdManagementCharges: 'No' },
      }),
      t
    ) as Row[];

    expect(keysOf(rows)).toEqual([
      'rows.tribunalPreviouslyDeterminedTenancyRent.label',
      'rows.previousTribunalCaseReference.label',
      'rows.rentPaymentFrequency.label',
      'rows.rentCostMonthly.label',
      'rows.rentIncludesCouncilTax.label',
      'rows.rentInclusiveOfUtilityCharges.label',
      'rows.currentTenancyStartDate.label',
      'rows.currentTenancyEndDate.label',
      'rows.currentTenancyReplaceOriginalTenancy.label',
      'rows.anyOtherHouseholdManagementCharges.label',
    ]);
  });

  it('prefixes amounts with a pound sign and formats dates for display', () => {
    const rows = buildSectionCyaRows(
      buildReq({
        'rent-payment-frequency': {
          rentPaymentFrequency: 'weekly',
          'rentPaymentFrequency.rentCostWeekly': '212.50',
        },
        'current-tenancy-start-date': { currentTenancyStartDate: { day: '1', month: '2', year: '2000' } },
      }),
      t
    ) as Row[];

    expect(valueOf(rows, 'rows.rentCostWeekly.label')).toBe('£212.50');
    expect(valueOf(rows, 'rows.currentTenancyStartDate.label')).toBe('1 February 2000');
  });

  it('formats dates in Welsh when the request language is cy', () => {
    const rows = buildSectionCyaRows(
      buildReq(
        { 'current-tenancy-start-date': { currentTenancyStartDate: { day: '1', month: '2', year: '2000' } } },
        {},
        'cy'
      ),
      t
    ) as Row[];

    expect(valueOf(rows, 'rows.currentTenancyStartDate.label')).toBe('1 Chwefror 2000');
  });

  it('omits a date row when the date is incomplete', () => {
    const rows = buildSectionCyaRows(
      buildReq({ 'current-tenancy-start-date': { currentTenancyStartDate: { day: '1', month: '', year: '2000' } } }),
      t
    ) as Row[];

    expect(keysOf(rows)).not.toContain('rows.currentTenancyStartDate.label');
  });

  it('shows the free text instead of the frequency when Other is selected', () => {
    const rows = buildSectionCyaRows(
      buildReq({
        'rent-includes-council-tax': { rentIncludesCouncilTax: 'Yes' },
        'council-tax-frequency': {
          councilTaxFrequency: 'other',
          'councilTaxFrequency.councilTaxFrequencyAndCostDetails': 'Paid quarterly, around 400',
        },
      }),
      t
    ) as Row[];

    expect(valueOf(rows, 'rows.councilTaxFrequency.label')).toBe('Paid quarterly, around 400');
    expect(keysOf(rows)).not.toContain('rows.councilTaxCostWeekly.label');
  });

  it('escapes free text entered by the citizen', () => {
    const rows = buildSectionCyaRows(
      buildReq({
        'other-household-management-charges': { anyOtherHouseholdManagementCharges: 'Yes' },
        'other-household-management-charges-details': {
          otherHouseholdManagementChargesDetails: 'Repairs <script>alert(1)</script>\nand cleaning',
        },
      }),
      t
    ) as Row[];

    expect(valueOf(rows, 'rows.otherHouseholdManagementChargesDetails.label')).toBe(
      'Repairs &lt;script&gt;alert(1)&lt;/script&gt;<br>and cleaning'
    );
  });

  describe('conditional rows', () => {
    it('omits the tribunal case reference when the tribunal has not determined the rent', () => {
      const rows = buildSectionCyaRows(
        buildReq(
          { 'tribunal-previously-determined-rent': { tribunalPreviouslyDeterminedTenancyRent: 'No' } },
          { previousTribunalCaseReference: 'LON/00AD/SMO/2023/0001' }
        ),
        t
      ) as Row[];

      expect(keysOf(rows)).not.toContain('rows.previousTribunalCaseReference.label');
    });

    it('omits the council tax frequency when the rent does not include council tax', () => {
      const rows = buildSectionCyaRows(
        buildReq(
          { 'rent-includes-council-tax': { rentIncludesCouncilTax: 'No' } },
          { councilTaxFrequency: 'weekly', councilTaxCostWeekly: 12 }
        ),
        t
      ) as Row[];

      expect(keysOf(rows)).not.toContain('rows.councilTaxFrequency.label');
      expect(keysOf(rows)).not.toContain('rows.councilTaxCostWeekly.label');
    });

    it('omits the utilities frequency when the rent does not include utility charges', () => {
      const rows = buildSectionCyaRows(
        buildReq(
          { 'rent-inclusive-of-utility-charges': { rentInclusiveOfUtilityCharges: 'No' } },
          { utilitiesPaidFrequency: 'monthly', utilitiesCostMonthly: 80 }
        ),
        t
      ) as Row[];

      expect(keysOf(rows)).not.toContain('rows.utilitiesPaidFrequency.label');
      expect(keysOf(rows)).not.toContain('rows.utilitiesPaidCostMonthly.label');
    });

    it('omits the original tenancy start date when the tenancy does not replace an original', () => {
      const rows = buildSectionCyaRows(
        buildReq(
          { 'current-tenancy-replace-original-tenancy': { currentTenancyReplaceOriginalTenancy: 'NotSure' } },
          { originalTenancyStartDate: '1999-01-01T00:00:00' }
        ),
        t
      ) as Row[];

      expect(keysOf(rows)).toContain('rows.currentTenancyReplaceOriginalTenancy.label');
      expect(keysOf(rows)).not.toContain('rows.originalTenancyStartDate.label');
    });

    it('omits the other charges details and the vary question when there are no other charges', () => {
      const rows = buildSectionCyaRows(
        buildReq(
          { 'other-household-management-charges': { anyOtherHouseholdManagementCharges: 'No' } },
          {
            otherHouseholdManagementChargesDetails: 'Maintenance',
            additionalRentalServiceChargesVary: 'Yes',
            varyingAdditionalRentalServiceChargesDetails: 'They vary',
          }
        ),
        t
      ) as Row[];

      expect(keysOf(rows)).not.toContain('rows.otherHouseholdManagementChargesDetails.label');
      expect(keysOf(rows)).not.toContain('rows.additionalRentalServiceChargesVary.label');
      expect(keysOf(rows)).not.toContain('rows.varyingAdditionalRentalServiceChargesDetails.label');
    });

    it('omits how the charges vary when the charges do not vary', () => {
      const rows = buildSectionCyaRows(
        buildReq(
          {
            'other-household-management-charges': { anyOtherHouseholdManagementCharges: 'Yes' },
            'additional-rental-service-charges-vary': { additionalRentalServiceChargesVary: 'No' },
          },
          { varyingAdditionalRentalServiceChargesDetails: 'They vary' }
        ),
        t
      ) as Row[];

      expect(keysOf(rows)).toContain('rows.additionalRentalServiceChargesVary.label');
      expect(keysOf(rows)).not.toContain('rows.varyingAdditionalRentalServiceChargesDetails.label');
    });
  });

  describe('reading from the saved case', () => {
    it('falls back to the saved case when there is no form data', () => {
      const rows = buildSectionCyaRows(
        buildReq(
          {},
          {
            tribunalPreviouslyDeterminedTenancyRent: 'Yes',
            previousTribunalCaseReference: 'LON/00AD/SMO/2023/0001',
            rentPaymentFrequency: 'monthly',
            rentCostMonthly: 1000,
            currentTenancyStartDate: '2000-02-01T00:00:00',
          }
        ),
        t
      ) as Row[];

      expect(valueOf(rows, 'rows.previousTribunalCaseReference.label')).toBe('LON/00AD/SMO/2023/0001');
      expect(valueOf(rows, 'rows.rentCostMonthly.label')).toBe('£1000.00');
      expect(valueOf(rows, 'rows.currentTenancyStartDate.label')).toBe('1 February 2000');
    });

    it('maps the utilities cost field names the DTO returns', () => {
      const rows = buildSectionCyaRows(
        buildReq(
          {},
          {
            rentInclusiveOfUtilityCharges: 'Yes',
            utilitiesPaidFrequency: 'monthly',
            utilitiesCostMonthly: 80,
          }
        ),
        t
      ) as Row[];

      expect(valueOf(rows, 'rows.utilitiesPaidCostMonthly.label')).toBe('£80.00');
    });

    it('shows a saved amount of 0 rather than leaving the row out', () => {
      const rows = buildSectionCyaRows(buildReq({}, { rentPaymentFrequency: 'weekly', rentCostWeekly: 0 }), t) as Row[];

      expect(valueOf(rows, 'rows.rentCostWeekly.label')).toBe('£0.00');
    });

    it('prefers form data over the saved case', () => {
      const rows = buildSectionCyaRows(
        buildReq(
          {
            'rent-payment-frequency': {
              rentPaymentFrequency: 'weekly',
              'rentPaymentFrequency.rentCostWeekly': '150',
            },
          },
          { rentPaymentFrequency: 'monthly', rentCostWeekly: 999 }
        ),
        t
      ) as Row[];

      expect(valueOf(rows, 'rows.rentCostWeekly.label')).toBe('£150.00');
    });
  });

  it('builds a change link for each row, pointing at the step that asked the question', () => {
    const rows = buildSectionCyaRows(
      buildReq({ 'rent-includes-council-tax': { rentIncludesCouncilTax: 'Yes' } }),
      t
    ) as unknown as { actions: { items: { href: string }[] } }[];

    expect(rows[0].actions.items[0].href).toBe(
      '/1234123412341234/rent-includes-council-tax?edit=theCurrentRentAndOtherCosts'
    );
  });
});
