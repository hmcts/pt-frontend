import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { SummaryListRow, createRowContext, escapeWithLineBreaks } from '../../section-cya/cyaRow';
import { ApplicationSectionId } from '../../sections.config';

import { getFormDataString } from '@modules/steps';

const SECTION_ID: ApplicationSectionId = 'extraSupport';

export function buildSectionCyaRows(req: Request, t: TFunction): SummaryListRow[] {
  const ctx = createRowContext(req, SECTION_ID, t);
  if (!ctx) {
    return [];
  }
  const { rows, validatedCase, change } = ctx;

  const addRow = (field: string, stepSlug: string, value: SummaryListRow['value']) => {
    rows.push({
      key: { text: t(`rows.${field}.label`) },
      value,
      actions: { items: [change(stepSlug, `rows.${field}.changeHidden`)] },
    });
  };

  const extraSupport =
    getFormDataString(req, 'extra-support', 'extraSupport') ?? validatedCase?.extraSupportDetails?.extraSupportRequired;

  const extraSupportDetails =
    getFormDataString(req, 'extra-support', 'extraSupport.extraSupportDetails') ??
    validatedCase?.extraSupportDetails?.extraSupportRequiredDetails;

  if (extraSupport) {
    addRow('extraSupport', 'extra-support', {
      text: t(`rows.extraSupport.options.${extraSupport}`),
    });
  }

  if ((extraSupport === 'Yes' || extraSupport === 'YES') && extraSupportDetails) {
    addRow('extraSupportDetails', 'extra-support', {
      html: escapeWithLineBreaks(extraSupportDetails),
    });
  }

  return rows;
}
