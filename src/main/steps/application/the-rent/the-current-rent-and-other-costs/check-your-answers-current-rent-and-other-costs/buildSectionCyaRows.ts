import type { Request } from 'express';
import type { TFunction } from 'i18next';
import { DateTime } from 'luxon';

import { SummaryListRow, createRowContext, escapeWithLineBreaks, isYes } from '../../../section-cya/cyaRow';
import { ApplicationSectionId } from '../../../sections.config';

import { getFormData } from '@modules/steps';
import type { DateValue, RentDetails } from '@services/ccdCase.interface';
import { toDateParts } from '@utils/date';

const SECTION_ID: ApplicationSectionId = 'theCurrentRentAndOtherCosts';

type AmountFields = Record<string, string>;

const rentAmountFields: AmountFields = {
  weekly: 'rentCostWeekly',
  fortnightly: 'rentCostFortnightly',
  monthly: 'rentCostMonthly',
  yearly: 'rentCostYearly',
};

const councilTaxAmountFields: AmountFields = {
  weekly: 'councilTaxCostWeekly',
  fortnightly: 'councilTaxCostFortnightly',
  monthly: 'councilTaxCostMonthly',
  yearly: 'councilTaxCostYearly',
};

const utilitiesAmountFields: AmountFields = {
  weekly: 'utilitiesPaidCostWeekly',
  fortnightly: 'utilitiesPaidCostFortnightly',
  monthly: 'utilitiesPaidCostMonthly',
  yearly: 'utilitiesPaidCostYearly',
};

// RentDetails mirrors CurrentRentsDetailsDto, which drops "Paid" from the utilities cost fields.
const caseFieldNames: Record<string, string> = {
  utilitiesPaidCostWeekly: 'utilitiesCostWeekly',
  utilitiesPaidCostFortnightly: 'utilitiesCostFortnightly',
  utilitiesPaidCostMonthly: 'utilitiesCostMonthly',
  utilitiesPaidCostYearly: 'utilitiesCostYearly',
};

// The existing date helpers take an ISO string, but dates are stored here as three parts
const formatDateValue = (value: DateValue | undefined, lang: string): string | undefined => {
  if (!value?.day || !value?.month || !value?.year) {
    return undefined;
  }
  const parsed = DateTime.fromObject({
    day: Number(value.day),
    month: Number(value.month),
    year: Number(value.year),
  }).setLocale(lang === 'cy' ? 'cy' : 'en-gb');
  return parsed.isValid ? parsed.toFormat('d LLLL y') : undefined;
};

export function buildSectionCyaRows(req: Request, t: TFunction): SummaryListRow[] {
  const ctx = createRowContext(req, SECTION_ID, t);
  if (!ctx) {
    return [];
  }
  const { rows, validatedCase, change } = ctx;
  const stepData = (step: string): Record<string, unknown> => getFormData(req, step);
  const lang = req.i18n?.language ?? 'en';

  const rentDetails = validatedCase?.currentRentsDetails;

  const read = (step: string, field: string): string | undefined =>
    (stepData(step)[field] as string | undefined) ??
    (rentDetails?.[(caseFieldNames[field] ?? field) as keyof RentDetails] as string | undefined);

  const readSubField = (step: string, parent: string, field: string): string | undefined =>
    (stepData(step)[`${parent}.${field}`] as string | undefined) ??
    (rentDetails?.[(caseFieldNames[field] ?? field) as keyof RentDetails] as string | undefined);

  const readDate = (step: string, field: string): DateValue | undefined =>
    (stepData(step)[field] as DateValue | undefined) ??
    toDateParts(rentDetails?.[field as keyof RentDetails] as string | undefined);

  const pushYesNo = (step: string, field: string, answer: string): void => {
    rows.push({
      key: { text: t(`rows.${field}.label`) },
      value: { text: t(`rows.${field}.options.${answer.trim().toLowerCase()}`) },
      actions: { items: [change(step, `rows.${field}.changeHidden`)] },
    });
  };

  const pushTextRow = (step: string, field: string, value: string): void => {
    rows.push({
      key: { text: t(`rows.${field}.label`) },
      value: { html: escapeWithLineBreaks(value) },
      actions: { items: [change(step, `rows.${field}.changeHidden`)] },
    });
  };

  const pushDateRow = (step: string, field: string, value?: DateValue): void => {
    const formatted = formatDateValue(value ?? readDate(step, field), lang);
    if (formatted) {
      rows.push({
        key: { text: t(`rows.${field}.label`) },
        value: { text: formatted },
        actions: { items: [change(step, `rows.${field}.changeHidden`)] },
      });
    }
  };

  const pushFrequencyRows = (step: string, field: string, amountFields: AmountFields, detailsField: string): void => {
    const frequency = read(step, field);
    if (!frequency) {
      return;
    }

    const amountField = amountFields[frequency];

    if (!amountField) {
      const details = readSubField(step, field, detailsField);
      rows.push({
        key: { text: t(`rows.${field}.label`) },
        value: details ? { html: escapeWithLineBreaks(details) } : { text: t(`rows.${field}.options.${frequency}`) },
        actions: { items: [change(step, `rows.${field}.changeHidden`)] },
      });
      return;
    }

    rows.push({
      key: { text: t(`rows.${field}.label`) },
      value: { text: t(`rows.${field}.options.${frequency}`) },
      actions: { items: [change(step, `rows.${field}.changeHidden`)] },
    });

    const amount = readSubField(step, field, amountField);
    if (amount) {
      rows.push({
        key: { text: t(`rows.${amountField}.label`) },
        value: { text: `£${amount}` },
        actions: { items: [change(step, `rows.${amountField}.changeHidden`)] },
      });
    }
  };

  const tribunalDetermined = read('tribunal-previously-determined-rent', 'tribunalPreviouslyDeterminedTenancyRent');

  if (tribunalDetermined) {
    pushYesNo('tribunal-previously-determined-rent', 'tribunalPreviouslyDeterminedTenancyRent', tribunalDetermined);

    const caseReference = readSubField(
      'tribunal-previously-determined-rent',
      'tribunalPreviouslyDeterminedTenancyRent',
      'previousTribunalCaseReference'
    );

    if (isYes(tribunalDetermined) && caseReference) {
      pushTextRow('tribunal-previously-determined-rent', 'previousTribunalCaseReference', caseReference);
    }
  }

  pushFrequencyRows('rent-payment-frequency', 'rentPaymentFrequency', rentAmountFields, '');

  const rentIncludesCouncilTax = read('rent-includes-council-tax', 'rentIncludesCouncilTax');
  if (rentIncludesCouncilTax) {
    pushYesNo('rent-includes-council-tax', 'rentIncludesCouncilTax', rentIncludesCouncilTax);
  }

  if (isYes(rentIncludesCouncilTax)) {
    pushFrequencyRows(
      'council-tax-frequency',
      'councilTaxFrequency',
      councilTaxAmountFields,
      'councilTaxFrequencyAndCostDetails'
    );
  }

  const rentInclusiveOfUtilityCharges = read('rent-inclusive-of-utility-charges', 'rentInclusiveOfUtilityCharges');
  if (rentInclusiveOfUtilityCharges) {
    pushYesNo('rent-inclusive-of-utility-charges', 'rentInclusiveOfUtilityCharges', rentInclusiveOfUtilityCharges);
  }

  if (isYes(rentInclusiveOfUtilityCharges)) {
    pushFrequencyRows(
      'utilities-paid-frequency',
      'utilitiesPaidFrequency',
      utilitiesAmountFields,
      'utilitiesPaidFrequencyAndCostDetails'
    );
  }

  pushDateRow('current-tenancy-start-date', 'currentTenancyStartDate');
  pushDateRow('tenancy-end-date', 'currentTenancyEndDate');

  const replacesOriginal = read('current-tenancy-replace-original-tenancy', 'currentTenancyReplaceOriginalTenancy');
  if (replacesOriginal) {
    pushYesNo('current-tenancy-replace-original-tenancy', 'currentTenancyReplaceOriginalTenancy', replacesOriginal);

    if (isYes(replacesOriginal)) {
      const parts = stepData('current-tenancy-replace-original-tenancy');
      const prefix = 'currentTenancyReplaceOriginalTenancy.originalTenancyStartDate';
      const originalDate = parts?.[`${prefix}-day`]
        ? {
            day: parts[`${prefix}-day`] as string,
            month: parts[`${prefix}-month`] as string,
            year: parts[`${prefix}-year`] as string,
          }
        : toDateParts(rentDetails?.originalTenancyStartDate);

      pushDateRow('current-tenancy-replace-original-tenancy', 'originalTenancyStartDate', originalDate);
    }
  }

  const otherCharges = read('other-household-management-charges', 'anyOtherHouseholdManagementCharges');
  if (otherCharges) {
    pushYesNo('other-household-management-charges', 'anyOtherHouseholdManagementCharges', otherCharges);
  }

  const chargesDetails = read('other-household-management-charges-details', 'otherHouseholdManagementChargesDetails');
  if (isYes(otherCharges) && chargesDetails) {
    pushTextRow('other-household-management-charges-details', 'otherHouseholdManagementChargesDetails', chargesDetails);
  }

  const chargesVary = read('additional-rental-service-charges-vary', 'additionalRentalServiceChargesVary');
  if (isYes(otherCharges) && chargesVary) {
    pushYesNo('additional-rental-service-charges-vary', 'additionalRentalServiceChargesVary', chargesVary);

    const varyDetails = readSubField(
      'additional-rental-service-charges-vary',
      'additionalRentalServiceChargesVary',
      'varyingAdditionalRentalServiceChargesDetails'
    );

    if (isYes(chargesVary) && varyDetails) {
      pushTextRow(
        'additional-rental-service-charges-vary',
        'varyingAdditionalRentalServiceChargesDetails',
        varyDetails
      );
    }
  }

  return rows;
}
