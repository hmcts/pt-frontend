import type { Request } from 'express';
import type { TFunction } from 'i18next';

import {
  type SummaryListRow,
  escapeWithLineBreaks,
  getValidatedCase,
  isYes,
} from '../../../application/section-cya/cyaRow';

import type { RentDetails } from '@services/ccd/ccdCase.interface';
import { formatDateParts, toDateParts } from '@utils/date';
import { displayRentAmount } from '@utils/rentAmount';

type AmountField = keyof RentDetails;

const rentAmountFields: Record<string, AmountField> = {
  weekly: 'rentCostWeekly',
  fortnightly: 'rentCostFortnightly',
  monthly: 'rentCostMonthly',
  yearly: 'rentCostYearly',
};

const utilitiesAmountFields: Record<string, AmountField> = {
  weekly: 'utilitiesCostWeekly',
  fortnightly: 'utilitiesCostFortnightly',
  monthly: 'utilitiesCostMonthly',
  yearly: 'utilitiesCostYearly',
};

export function buildTenancyDetailsRows(req: Request, t: TFunction): SummaryListRow[] {
  const rentDetails = getValidatedCase(req)?.rentDetails;
  if (!rentDetails) {
    return [];
  }

  const rows: SummaryListRow[] = [];
  const lang = req.i18n?.language ?? 'en';

  const push = (labelKey: string, value: SummaryListRow['value']): void => {
    rows.push({ key: { text: t(`tenancyDetails.rows.${labelKey}`) }, value });
  };

  const pushYesNo = (labelKey: string, answer: unknown): void => {
    if (typeof answer === 'string' && answer.trim() !== '') {
      push(labelKey, { text: t(`common:${answer.trim().toLowerCase()}`) });
    }
  };

  const pushAmount = (labelKey: string, value: unknown): void => {
    const amount = displayRentAmount(value);
    if (amount !== undefined) {
      push(labelKey, { text: `£${amount}` });
    }
  };

  pushYesNo('tribunalPreviouslyDeterminedTenancyRent', rentDetails.tribunalPreviouslyDeterminedTenancyRent);

  const rentFrequency = rentDetails.rentPaymentFrequency;
  if (rentFrequency) {
    push('rentPaymentFrequency', { text: t(`tenancyDetails.frequency.${rentFrequency}`) });
    const amountField = rentAmountFields[rentFrequency];
    if (amountField) {
      pushAmount('rentCost', rentDetails[amountField]);
    }
  }

  pushYesNo('rentIncludesCouncilTax', rentDetails.rentIncludesCouncilTax);
  pushYesNo('rentInclusiveOfUtilityCharges', rentDetails.rentInclusiveOfUtilityCharges);

  const utilitiesFrequency = rentDetails.utilitiesPaidFrequency;
  if (isYes(rentDetails.rentInclusiveOfUtilityCharges) && utilitiesFrequency) {
    const amountField = utilitiesAmountFields[utilitiesFrequency];
    if (amountField) {
      pushAmount('utilitiesCost', rentDetails[amountField]);
    }
    const otherDetails = rentDetails.utilitiesPaidFrequencyAndCostDetails;
    push(
      'utilitiesPaidFrequency',
      utilitiesFrequency === 'other' && otherDetails
        ? { html: escapeWithLineBreaks(otherDetails) }
        : { text: t(`tenancyDetails.frequency.${utilitiesFrequency}`) }
    );
  }

  const startDate = formatDateParts(toDateParts(rentDetails.currentTenancyStartDate), lang);
  if (startDate) {
    push('currentTenancyStartDate', { text: startDate });
  }

  const otherCharges = rentDetails.anyOtherHouseholdManagementCharges;
  pushYesNo('anyOtherHouseholdManagementCharges', otherCharges);
  if (isYes(otherCharges)) {
    const chargesDetails = rentDetails.otherHouseholdManagementChargesDetails;
    if (chargesDetails) {
      push('otherHouseholdManagementChargesDetails', { html: escapeWithLineBreaks(chargesDetails) });
    }
    pushYesNo('additionalRentalServiceChargesVary', rentDetails.additionalRentalServiceChargesVary);
  }

  return rows;
}
