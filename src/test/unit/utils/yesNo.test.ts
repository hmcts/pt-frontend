import { invertYesNo } from '@utils/yesNo';

describe('invertYesNo', () => {
  it('should swap Yes and No', () => {
    expect(invertYesNo('Yes')).toBe('No');
    expect(invertYesNo('No')).toBe('Yes');
  });

  it('should return undefined when there is no answer', () => {
    expect(invertYesNo(undefined)).toBeUndefined();
    expect(invertYesNo('')).toBeUndefined();
  });
});
