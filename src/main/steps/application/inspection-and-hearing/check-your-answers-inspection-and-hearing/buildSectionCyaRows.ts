import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { SummaryListRow, createRowContext, escapeWithLineBreaks } from '../../section-cya/cyaRow';
import { ApplicationSectionId } from '../../sections.config';

import { getFormDataString } from '@modules/steps';
import { invertYesNo } from '@utils/yesNo';

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

  const hearing =
    getFormDataString(req, 'hearing', 'agreeToDecisionWithoutHearing') ?? invertYesNo(details?.hearingRequested);
  const hearingReason =
    getFormDataString(req, 'hearing', 'agreeToDecisionWithoutHearing.noDecisionWithoutHearingReason') ??
    details?.reasonHearingRequested;

  if (hearing) {
    addRow('agreeToDecisionWithoutHearing', 'hearing', {
      text: t(`rows.agreeToDecisionWithoutHearing.options.${hearing}`),
    });
  }
  if (hearing === 'No' && hearingReason) {
    addRow('noDecisionWithoutHearingReason', 'hearing', { html: escapeWithLineBreaks(hearingReason) });
  }

  return rows;
}
