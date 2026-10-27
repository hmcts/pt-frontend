import { CcdCase, CcdCaseData } from './ccdCase.interface';

export class CcdCaseModel {
  protected readonly validatedCase: CcdCase;

  constructor(validatedCase: CcdCase) {
    this.validatedCase = validatedCase;
  }

  get data(): CcdCaseData {
    return this.validatedCase.data ?? {};
  }

  get id(): string {
    return this.validatedCase.id ?? '';
  }
}
