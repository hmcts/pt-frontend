// UK postcode area prefixes that are exclusively Scotland, Wales, or Northern Ireland.
// Anything not in these sets (and not the Channel Islands/Isle of Man) is treated as England.
const SCOTLAND_AREAS = new Set([
  'AB',
  'DD',
  'DG',
  'EH',
  'FK',
  'G',
  'HS',
  'IV',
  'KA',
  'KW',
  'KY',
  'ML',
  'PA',
  'PH',
  'TD',
  'ZE',
]);
const WALES_AREAS = new Set(['CF', 'LD', 'LL', 'NP', 'SA', 'SY']);
const NI_AREAS = new Set(['BT']);
const NON_UK_AREAS = new Set(['GY', 'JE', 'IM']); // Channel Islands / Isle of Man

const POSTCODE_REGEX =
  /^([Gg][Ii][Rr] ?0[Aa]{2})|((([A-Za-z][0-9]{1,2})|([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))\s?[0-9][A-Za-z]{2})$/;

export function isValidPostcode(postcode: string): boolean {
  const clean = postcode.trim().toUpperCase();
  return POSTCODE_REGEX.test(clean);
}

export function isNotEnglishPostcode(postcode: string): boolean {
  const clean = postcode.trim().toUpperCase();
  const match = clean.match(/^([A-Z]{1,2})[0-9]/);
  if (!match) {
    return true; // e.g. GIR 0AA — no standard area, not treated as England
  }

  const area = match[1];

  return SCOTLAND_AREAS.has(area) || WALES_AREAS.has(area) || NI_AREAS.has(area) || NON_UK_AREAS.has(area);
}
