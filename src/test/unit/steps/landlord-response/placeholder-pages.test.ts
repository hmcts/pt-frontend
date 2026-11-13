import type { Request } from 'express';

import { step as reviewPropertyDetails } from '../../../../main/steps/landlord-response/your-response/review-property-details';
import { step as servedNoticeProposingNewRent } from '../../../../main/steps/landlord-response/your-response/served-notice-proposing-new-rent';
import { step as yourPhoneNumber } from '../../../../main/steps/landlord-response/your-response/your-phone-number';

describe('landlord response placeholder pages', () => {
  it.each([
    ['your-phone-number', yourPhoneNumber],
    ['served-notice-proposing-new-rent', servedNoticeProposingNewRent],
    ['review-property-details', reviewPropertyDetails],
  ])('%s is never answered', (_name, step) => {
    expect(step.isAnswered?.({} as Request)).toBe(false);
  });
});
