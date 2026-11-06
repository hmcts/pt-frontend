import type { ApplicationStepName } from './application/stepRegistry';
import type { LandlordResponseStepName } from './landlord-response/stepRegistry';
import type { LinkPartyToCaseStepName } from './link-party-to-case/stepRegistry';
import type { NewApplicationStepName } from './new-application/stepRegistry';
import type { PreApplicationStepName } from './pre-application/stepRegistry';

export type StepName =
  | ApplicationStepName
  | LandlordResponseStepName
  | LinkPartyToCaseStepName
  | NewApplicationStepName
  | PreApplicationStepName;
