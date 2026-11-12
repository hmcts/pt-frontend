import { formatDate, formatDateParts, toDateParts } from '@utils/date';

describe('formatDate', () => {
  it('should correctly format provided date', () => {
    expect(formatDate('2026-07-28T10:54:13.43763')).toBe('28 July 2026');
    expect(formatDate('2026-01-01T10:54:13.43763')).toBe('01 January 2026');
    expect(formatDate('2026-01-01T00:54:13.43763')).toBe('01 January 2026');
    expect(formatDate('2001-01-01T00:54:13.43763')).toBe('01 January 2001');
  });
});

describe('toDateParts', () => {
  it('splits an ISO datetime into day, month and year', () => {
    expect(toDateParts('2000-01-02T00:00:00')).toEqual({ day: '02', month: '01', year: '2000' });
  });

  it('splits a date-only string', () => {
    expect(toDateParts('2027-12-31')).toEqual({ day: '31', month: '12', year: '2027' });
  });

  it('returns undefined when the value is missing', () => {
    expect(toDateParts(undefined)).toBeUndefined();
    expect(toDateParts('')).toBeUndefined();
  });

  test('returns undefined when there is no date to format', () => {
    expect(formatDate(undefined)).toBeUndefined();
    expect(formatDate('')).toBeUndefined();
  });

  test('returns undefined rather than throwing for a value that is not a date', () => {
    expect(formatDate('not-a-date')).toBeUndefined();
  });
});

describe('formatDateParts', () => {
  it('formats a date in English', () => {
    expect(formatDateParts({ day: '02', month: '01', year: '2000' }, 'en')).toBe('2 January 2000');
  });

  it('formats a date with Welsh month names', () => {
    expect(formatDateParts({ day: '02', month: '01', year: '2000' }, 'cy')).toBe('2 Ionawr 2000');
  });

  it('returns undefined when a part is missing', () => {
    expect(formatDateParts(undefined, 'en')).toBeUndefined();
    expect(formatDateParts({ day: '', month: '01', year: '2000' }, 'en')).toBeUndefined();
  });

  it('returns undefined for a date that does not exist', () => {
    expect(formatDateParts({ day: '31', month: '02', year: '2000' }, 'en')).toBeUndefined();
  });
});
