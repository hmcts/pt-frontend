/**
 * pt-api stores the hearing answer as hearingRequested, the opposite of what the hearing page asks
 * (do you agree to a decision without a hearing). Yes on the page is saved as No, and swapped back when read.
 */
export function invertYesNo(value: string | undefined): string | undefined {
  if (value === 'Yes') {
    return 'No';
  }
  if (value === 'No') {
    return 'Yes';
  }
  return undefined;
}
