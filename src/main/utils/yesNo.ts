export function invertYesNo(value: string | undefined): string | undefined {
  if (value === 'Yes') {
    return 'No';
  }
  if (value === 'No') {
    return 'Yes';
  }
  return undefined;
}
