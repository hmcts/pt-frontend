import { CcdCase } from '@services/ccd/ccdCase.interface';
import { CcdCaseModel } from '@services/ccd/ccdCaseData.model';

describe('CcdCaseModel', () => {
  describe('fallback getters', () => {
    it('returns safe defaults when case data is missing', () => {
      const model = new CcdCaseModel({} as CcdCase);

      expect(model.data).toEqual({});
      expect(model.id).toBe('');
    });
  });
});
