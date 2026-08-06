import { formatDate } from '@utils/date';

describe('formatDate', () => {
  it('should correctly format provided date', () => {
    expect(formatDate('2026-07-28T10:54:13.43763')).toBe('28 July 2026');
    expect(formatDate('2026-01-01T10:54:13.43763')).toBe('01 January 2026');
    expect(formatDate('2026-01-01T00:54:13.43763')).toBe('01 January 2026');
    expect(formatDate('2001-01-01T00:54:13.43763')).toBe('01 January 2001');
  });
});
