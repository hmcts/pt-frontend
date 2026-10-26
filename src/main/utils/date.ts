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
