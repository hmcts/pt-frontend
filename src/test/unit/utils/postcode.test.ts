import {
  isNotValidUnitedKingdomPostcode,
  isPartOfInitialRollout,
  isValidEnglishPostcode,
  isValidPostcode,
} from '@utils/postcode';

describe('isValidPostcode', () => {
  it('should correctly validate postcode', () => {
    expect(isValidPostcode('W1 1BW')).toBe(true);
    expect(isValidPostcode('B1 1BH')).toBe(true);
    expect(isValidPostcode('CT15 8AJ')).toBe(true);
    expect(isValidPostcode('DDD1 123')).toBe(false);
    expect(isValidPostcode('W1 123')).toBe(false);
    expect(isValidPostcode('W1')).toBe(false);
    expect(isValidPostcode('123')).toBe(false);
    expect(isValidPostcode('invalid')).toBe(false);
  });
});

describe('isNotValidUnitedKingdomPostcode', () => {
  it('should correctly validate whether a postcode is a valid United Kingdom postcode', () => {
    expect(isNotValidUnitedKingdomPostcode('W1 1BW')).toBe(false);
    expect(isNotValidUnitedKingdomPostcode('BT1 1BW')).toBe(false);
    expect(isNotValidUnitedKingdomPostcode('AZ1 1BW')).toBe(true);
    expect(isNotValidUnitedKingdomPostcode('ZA1 1BW')).toBe(true);
  });
});

describe('isValidEnglishPostcode', () => {
  it('should correctly validate whether a postcode is a valid English postcode', () => {
    expect(isValidEnglishPostcode('B1 1BH')).toStrictEqual(true);
    expect(isValidEnglishPostcode('W1 1BH')).toStrictEqual(true);
    expect(isValidEnglishPostcode('G1 1BH')).toStrictEqual(false);
    expect(isValidEnglishPostcode('BT1 1BH')).toStrictEqual(false);
    expect(isValidEnglishPostcode('GY1 1BH')).toStrictEqual(false);
    expect(isValidEnglishPostcode('JE1 1BH')).toStrictEqual(false);
    expect(isValidEnglishPostcode('IM1 1BH')).toStrictEqual(false);
    expect(isValidEnglishPostcode('CF1 1BH')).toStrictEqual(false);
    expect(isValidEnglishPostcode('LD1 1BH')).toStrictEqual(false);
    expect(isValidEnglishPostcode('LL1 1BH')).toStrictEqual(false);
  });
});

describe('isPartOfInitialRollout', () => {
  it('should correctly validate whether a postcode is a part of the initial rollout', () => {
    expect(isPartOfInitialRollout('B1 1BH')).toStrictEqual(true);
    expect(isPartOfInitialRollout('M1 1BH')).toStrictEqual(true);
    expect(isPartOfInitialRollout('W1 1BH')).toStrictEqual(false);
    expect(isPartOfInitialRollout('CT1 1BH')).toStrictEqual(false);
    expect(isPartOfInitialRollout('NE1 1BH')).toStrictEqual(false);
    expect(isPartOfInitialRollout('L1 1BH')).toStrictEqual(false);
    expect(isPartOfInitialRollout('SW19 1BH')).toStrictEqual(false);
    expect(isPartOfInitialRollout('CF1 1BH')).toStrictEqual(false);
    expect(isPartOfInitialRollout('LD1 1BH')).toStrictEqual(false);
    expect(isPartOfInitialRollout('LL1 1BH')).toStrictEqual(false);
  });
});
