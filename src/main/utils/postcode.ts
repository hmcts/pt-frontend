// Postcodes included in the initial rollout of the service
const INITIAL_ROLLOUT_AREAS = new Set(['B', 'M']);

// UK postcode area prefixes that are exclusively Scotland, Wales, or Northern Ireland.
// Anything not in these sets (and not the Channel Islands/Isle of Man) is treated as England.
const ENGLAND_AREAS = new Set([
  'AL',
  'B',
  'BA',
  'BB',
  'BD',
  'BH',
  'BL',
  'BN',
  'BR',
  'BS',
  'CA',
  'CB',
  'CH',
  'CM',
  'CO',
  'CR',
  'CT',
  'CV',
  'CW',
  'DA',
  'DE',
  'DH',
  'DL',
  'DN',
  'DT',
  'DY',
  'E',
  'EC',
  'EN',
  'EX',
  'FY',
  'GL',
  'GU',
  'HA',
  'HD',
  'HG',
  'HP',
  'HR',
  'HU',
  'HX',
  'IG',
  'IP',
  'KT',
  'L',
  'LA',
  'LE',
  'LN',
  'LS',
  'LU',
  'M',
  'ME',
  'MK',
  'N',
  'NE',
  'NG',
  'NN',
  'NR',
  'NW',
  'OL',
  'OX',
  'PE',
  'PL',
  'PO',
  'PR',
  'RG',
  'RH',
  'RM',
  'S',
  'SE',
  'SG',
  'SK',
  'SL',
  'SM',
  'SN',
  'SO',
  'SP',
  'SR',
  'SS',
  'ST',
  'SW',
  'TA',
  'TF',
  'TN',
  'TQ',
  'TR',
  'TS',
  'TW',
  'UB',
  'W',
  'WA',
  'WC',
  'WD',
  'WF',
  'WN',
  'WR',
  'WS',
  'WV',
  'YO',
]);
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

const POSTCODE_REGEX: RegExp =
  /^([Gg][Ii][Rr] ?0[Aa]{2})|((([A-Za-z][0-9]{1,2})|([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))\s?[0-9][A-Za-z]{2})$/;
const POSTCODE_AREA_REGEX: RegExp = /^([A-Z]{1,2})[0-9]/;

export function isValidPostcode(postcode: string): boolean {
  const clean = postcode.trim().toUpperCase();
  return POSTCODE_REGEX.test(clean);
}

export function isNotValidUnitedKingdomPostcode(postcode: string): boolean {
  const clean = postcode.trim().toUpperCase();
  const match = clean.match(POSTCODE_AREA_REGEX);
  if (!match) {
    return true; // e.g. GIR 0AA — no standard area, not treated as England
  }

  const area = match[1];

  return (
    !ENGLAND_AREAS.has(area) &&
    !SCOTLAND_AREAS.has(area) &&
    !WALES_AREAS.has(area) &&
    !NI_AREAS.has(area) &&
    !NON_UK_AREAS.has(area)
  );
}

export function isValidEnglishPostcode(postcode: string): boolean {
  return postcodeAreaIn(postcode, ENGLAND_AREAS);
}

export function isPartOfInitialRollout(postcode: string): boolean {
  return postcodeAreaIn(postcode, INITIAL_ROLLOUT_AREAS);
}

function postcodeAreaIn(postcode: string, areas: Set<string>): boolean {
  const area = getPostcodeArea(postcode.trim().toUpperCase());
  return area !== null && areas.has(area);
}

function getPostcodeArea(clean: string): string | null {
  const match = clean.match(POSTCODE_AREA_REGEX);
  return match ? match[1] : null;
}
