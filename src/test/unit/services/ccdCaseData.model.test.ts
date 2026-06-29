import { CcdCase } from '../../../main/services/ccdCase.interface';
import { CcdCaseModel } from '../../../main/services/ccdCaseData.model';

describe('CcdCaseModel', () => {
  describe('fallback getters', () => {
    it('returns safe defaults when case data is missing', () => {
      const model = new CcdCaseModel({} as CcdCase);

      expect(model.data).toEqual({});
      expect(model.id).toBe('');
    });
  });
});
