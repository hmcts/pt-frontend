import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { SummaryListRow, createRowContext, escapeWithLineBreaks } from '../../section-cya/cyaRow';
import { ApplicationSectionId } from '../../sections.config';

import { getFormDataString } from '@modules/steps';

const SECTION_ID: ApplicationSectionId = 'propertyInspection';

export function buildSectionCyaRows(req: Request, t: TFunction): SummaryListRow[] {
  const ctx = createRowContext(req, SECTION_ID, t);
  if (ctx === undefined) {
    return [];
  }
  const { rows, validatedCase, change } = ctx;
  const details = validatedCase?.hearingInspectionDetails;

  const addRow = (field: string, stepSlug: string, value: SummaryListRow['value']) => {
    rows.push({
      key: { text: t(`rows.${field}.label`) },
      value,
      actions: { items: [change(stepSlug, `rows.${field}.changeHidden`)] },
    });
  };

  const inspection =
    getFormDataString(req, 'property-inspection', 'agreeToDecisionWithoutInspection') ??
    details?.agreeToDecisionWithoutInspection;
  const inspectionReason =
    getFormDataString(
      req,
      'property-inspection',
      'agreeToDecisionWithoutInspection.noDecisionWithoutInspectionReason'
    ) ?? details?.noDecisionWithoutInspectionReason;

  if (inspection) {
    addRow('agreeToDecisionWithoutInspection', 'property-inspection', {
      text: t(`rows.agreeToDecisionWithoutInspection.options.${inspection}`),
    });
  }
  if (inspection === 'No' && inspectionReason) {
    addRow('noDecisionWithoutInspectionReason', 'property-inspection', {
      html: escapeWithLineBreaks(inspectionReason),
    });
  }

  const hearing = getFormDataString(req, 'hearing', 'hearingRequested') ?? details?.hearingRequested;
  const hearingReason =
    getFormDataString(req, 'hearing', 'hearingRequested.reasonHearingRequested') ?? details?.reasonHearingRequested;

  if (hearing) {
    addRow('hearingRequested', 'hearing', {
      text: t(`rows.hearingRequested.options.${hearing}`),
    });
  }
  if (hearing === 'Yes' && hearingReason) {
    addRow('reasonHearingRequested', 'hearing', { html: escapeWithLineBreaks(hearingReason) });
  }

  return rows;
}
