import { DateTime } from 'luxon';

export function formatDate(isoString: string | undefined): string | undefined {
  if (!isoString) {
    return undefined;
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function toDateParts(value: string | undefined): { day: string; month: string; year: string } | undefined {
  if (!value) {
    return undefined;
  }
  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) {
    return undefined;
  }
  return { day, month, year };
}

/**
 * Formats day, month and year parts as "1 January 2026", with Welsh month names when lang is cy.
 * formatDate above takes an ISO string and always formats in English with a two digit day.
 */
export function formatDateParts(
  value: { day: string; month: string; year: string } | undefined,
  lang: string
): string | undefined {
  if (!value?.day || !value?.month || !value?.year) {
    return undefined;
  }
  const parsed = DateTime.fromObject({
    day: Number(value.day),
    month: Number(value.month),
    year: Number(value.year),
  }).setLocale(lang === 'cy' ? 'cy' : 'en-gb');
  return parsed.isValid ? parsed.toFormat('d LLLL y') : undefined;
}
