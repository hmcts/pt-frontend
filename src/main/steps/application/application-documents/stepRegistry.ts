import { step as hardship } from './landlords-notice/hardship';
import { step as haveLandlordsNotice } from './landlords-notice/have-landlords-notice';
import { step as uploadEvidenceNoticeNotLegallyValid } from './landlords-notice/upload-evidence-notice-not-legally-valid';
import { step as yourNoticeProposingANewRent } from './landlords-notice/your-notice-proposing-a-new-rent';
import { step as checkYourAnswersYourTenancyAgreement } from './your-tenancy-agreement/check-your-answers-your-tenancy-agreement';
import { step as haveTenancyAgreement } from './your-tenancy-agreement/have-tenancy-agreement';
import { step as uploadTenancyAgreement } from './your-tenancy-agreement/upload-tenancy-agreement';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

export const applicationDocumentsStepRegistry = {
  'have-landlords-notice': haveLandlordsNotice,
  'your-notice-proposing-a-new-rent': yourNoticeProposingANewRent,
  'upload-evidence-notice-not-legally-valid': uploadEvidenceNoticeNotLegallyValid,
  hardship,
  'have-tenancy-agreement': haveTenancyAgreement,
  'upload-tenancy-agreement': uploadTenancyAgreement,
  'check-your-answers-your-tenancy-agreement': checkYourAnswersYourTenancyAgreement,
} satisfies Record<string, StepDefinition>;
