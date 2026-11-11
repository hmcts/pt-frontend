import type { Request } from 'express';
import type { TFunction } from 'i18next';
import { DateTime } from 'luxon';

import { SummaryListRow, createRowContext, escapeWithLineBreaks, isYes } from '../../section-cya/cyaRow';
import { ApplicationSectionId } from '../../sections.config';

import type { DisplayDocument } from '@modules/documents/storage';
import { getFormData } from '@modules/steps';
import type { DateValue, RentDetails } from '@services/ccd/ccdCase.interface';
import { toDateParts } from '@utils/date';
import { displayRentAmount } from '@utils/rentAmount';

const SECTION_ID: ApplicationSectionId = 'rentDetails';

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

// RentDetails mirrors RentDetailsDto, which drops "Paid" from the utilities cost fields
// and names the anything else answers differently from the page.
const caseFieldNames: Record<string, string> = {
  utilitiesPaidCostWeekly: 'utilitiesCostWeekly',
  utilitiesPaidCostFortnightly: 'utilitiesCostFortnightly',
  utilitiesPaidCostMonthly: 'utilitiesCostMonthly',
  utilitiesPaidCostYearly: 'utilitiesCostYearly',
  additionalInfoToConsiderWhenDeterminingRent: 'additionalPropertyInfoToConsiderWhenDetermining',
  additionalInfoToConsiderWhenDeterminingRentDetails: 'additionalPropertyInfoToConsiderWhenDeterminingDetails',
};

const marketRentFrequencies = ['weekly', 'fortnightly', 'monthly', 'yearly'];

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

  const rentDetails = validatedCase?.rentDetails;

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

    const amount = displayRentAmount(readSubField(step, field, amountField));
    if (amount !== undefined) {
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

  const marketRent = displayRentAmount(read('proposed-market-rent', 'applicantSuggestedMarketRent'));
  const marketRentFrequency = read('proposed-market-rent', 'applicantSuggestedMarketRentFrequency');

  if (marketRent !== undefined) {
    const marketRentKey =
      marketRentFrequency && marketRentFrequencies.includes(marketRentFrequency)
        ? `rows.applicantSuggestedMarketRent.${marketRentFrequency}`
        : 'rows.applicantSuggestedMarketRent';

    rows.push({
      key: { text: t(`${marketRentKey}.label`) },
      value: { text: `£${marketRent}` },
      actions: { items: [change('proposed-market-rent', `${marketRentKey}.changeHidden`)] },
    });
  }

  const marketRentFrequencyOther = readSubField(
    'proposed-market-rent',
    'applicantSuggestedMarketRentFrequency',
    'applicantSuggestedMarketRentFrequencyOther'
  );
  if (marketRentFrequency === 'other' && marketRentFrequencyOther) {
    pushTextRow('proposed-market-rent', 'applicantSuggestedMarketRentFrequencyOther', marketRentFrequencyOther);
  }

  const marketRentReasons = read('proposed-market-rent-reasons', 'applicantSuggestedMarketRentReasons');
  if (marketRentReasons) {
    pushTextRow('proposed-market-rent-reasons', 'applicantSuggestedMarketRentReasons', marketRentReasons);
  }

  const sessionEvidence = stepData('upload-evidence-proposed-market-rent').documents as DisplayDocument[] | undefined;
  const evidenceFilenames = (
    sessionEvidence?.map(document => document.document_filename) ??
    rentDetails?.suggestedMarketRentEvidence?.map(document => document.filename) ??
    []
  ).filter((filename): filename is string => Boolean(filename));

  if (evidenceFilenames.length > 0) {
    rows.push({
      key: { text: t('rows.suggestedMarketRentEvidence.label') },
      value: { html: evidenceFilenames.map(filename => escapeWithLineBreaks(filename)).join('<br>') },
      actions: {
        items: [change('upload-evidence-proposed-market-rent', 'rows.suggestedMarketRentEvidence.changeHidden')],
      },
    });
  }

  const anythingElse = read('anything-else-tribunal-should-consider', 'additionalInfoToConsiderWhenDeterminingRent');
  if (anythingElse) {
    pushYesNo('anything-else-tribunal-should-consider', 'additionalInfoToConsiderWhenDeterminingRent', anythingElse);

    const anythingElseDetails = readSubField(
      'anything-else-tribunal-should-consider',
      'additionalInfoToConsiderWhenDeterminingRent',
      'additionalInfoToConsiderWhenDeterminingRentDetails'
    );

    if (isYes(anythingElse) && anythingElseDetails) {
      pushTextRow(
        'anything-else-tribunal-should-consider',
        'additionalInfoToConsiderWhenDeterminingRentDetails',
        anythingElseDetails
      );
    }
  }

  return rows;
}
