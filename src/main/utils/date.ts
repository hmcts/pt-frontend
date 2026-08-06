export function formatDate(isoString: string): string {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
