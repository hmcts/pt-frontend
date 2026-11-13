import type { Request } from 'express';

import { getFormData } from '@modules/steps/formBuilder/helpers';
import type { PTCaseData } from '@services/ccd/ccdCase.interface';
import { toCaseReference16 } from '@utils/caseReference';

type DateParts = { day?: string; month?: string; year?: string };

/** Saved answers are only safe to fall back on when they belong to the case being written. */
export function caseForThisRequest(req: Request, ccdCase: PTCaseData | undefined): PTCaseData | undefined {
  const routeCaseReference = toCaseReference16(req.params?.caseReference);
  if (!routeCaseReference || ccdCase?.caseReference === undefined) {
    return undefined;
  }
  return String(ccdCase.caseReference) === routeCaseReference ? ccdCase : undefined;
}

export const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const toIsoDate = (day?: unknown, month?: unknown, year?: unknown): string | undefined => {
  if (!day || !month || !year) {
    return undefined;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const dateParts = (req: Request, step: string, field: string): DateParts | undefined =>
  getFormData(req, step)[field] as DateParts | undefined;
