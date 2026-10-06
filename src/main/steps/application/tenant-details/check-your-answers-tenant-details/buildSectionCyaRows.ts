import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { SummaryListRow, createRowContext } from '../../section-cya/cyaRow';
import { ApplicationSectionId } from '../../sections.config';

import { getFormDataString } from '@modules/steps';

const SECTION_ID: ApplicationSectionId = 'whoIsOnTheTenancy';

export function buildSectionCyaRows(req: Request, t: TFunction): SummaryListRow[] {
  const ctx = createRowContext(req, SECTION_ID, t);
  if (!ctx) {
    return [];
  }
  const { rows, validatedCase, change } = ctx;

  const addRow = (field: string, value: string | undefined, changeHref: string, valueText: string = value ?? '') => {
    if (value) {
      rows.push({
        key: { text: t(`rows.${field}.label`) },
        value: { text: valueText },
        actions: { items: [change(changeHref, `rows.${field}.changeHidden`)] },
      });
    }
  };

  const applicantFirstName =
    getFormDataString(req, 'your-information', 'applicantFirstName') ?? validatedCase?.applicantFirstName;
  addRow('applicantFirstName', applicantFirstName, 'your-information');

  const applicantLastName =
    getFormDataString(req, 'your-information', 'applicantLastName') ?? validatedCase?.applicantLastName;
  addRow('applicantLastName', applicantLastName, 'your-information');

  const companyName =
    getFormDataString(req, 'your-information', 'companyName') ?? validatedCase?.tenantDetails?.companyName;
  addRow('companyName', companyName, 'your-information');

  const referenceNumberForCommunications =
    getFormDataString(req, 'your-information', 'referenceNumberForCommunications') ??
    validatedCase?.tenantDetails?.referenceNumberForCommunications;
  addRow('referenceNumberForCommunications', referenceNumberForCommunications, 'your-information');

  return rows;
}
