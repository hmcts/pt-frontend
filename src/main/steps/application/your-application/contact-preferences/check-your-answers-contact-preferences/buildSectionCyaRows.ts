import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { SummaryListRow, createRowContext } from '../../../section-cya/cyaRow';
import { ApplicationSectionId } from '../../../sections.config';

const SECTION_ID: ApplicationSectionId = 'contactPreferences';

export function buildSectionCyaRows(req: Request, t: TFunction): SummaryListRow[] {
  const ctx = createRowContext(req, SECTION_ID, t);
  if (!ctx) {
    return [];
  }
  const { rows, validatedCase, change } = ctx;
  const formData = req.session.formData;

  const addRow = (field: string, value: string | undefined, changeHref: string, valueText: string = value ?? '') => {
    if (value) {
      rows.push({
        key: { text: t(`rows.${field}.label`) },
        value: { text: valueText },
        actions: { items: [change(changeHref, `rows.${field}.changeHidden`)] },
      });
    }
  };

  const textUpdates =
    formData?.['text-updates']?.textUpdates ?? validatedCase?.applicantContactPreferences?.contactByText;
  addRow('textUpdates', textUpdates, 'text-updates', textUpdates && t(`rows.textUpdates.options.${textUpdates}`));

  const textUpdatesPhoneNumber =
    formData?.['text-updates']?.['textUpdates.textUpdatesPhoneNumber'] ??
    validatedCase?.applicantContactPreferences?.mobilePhoneNumber;
  if (textUpdates === 'Yes') {
    addRow('textUpdatesPhoneNumber', textUpdatesPhoneNumber, 'text-updates');
  }

  const phoneNumberForCalls =
    formData?.['contact-by-phone']?.phoneNumberForCalls ?? validatedCase?.applicantContactPreferences?.phoneNumber;
  addRow('phoneNumberForCalls', phoneNumberForCalls, 'contact-by-phone');

  return rows;
}
