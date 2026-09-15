import type { Request } from 'express';
import type { TFunction } from 'i18next';

import { SummaryListRow, createRowContext } from '../../../section-cya/cyaRow';
import { ApplicationSectionId } from '../../../sections.config';

import { type DisplayDocument } from '@modules/documents/storage';
import { getFormData, getFormDataString } from '@modules/steps';

const SECTION_ID: ApplicationSectionId = 'yourTenancyAgreement';

export function buildSectionCyaRows(req: Request, t: TFunction): SummaryListRow[] {
  const ctx = createRowContext(req, SECTION_ID, t);
  if (!ctx) {
    return [];
  }
  const { rows, validatedCase, change } = ctx;
  const tenancyDetails = validatedCase?.tenancyAgreementDetails;

  const addRow = (field: string, value: string | undefined, changeHref: string, valueText: string = value ?? '') => {
    if (value) {
      rows.push({
        key: { text: t(`rows.${field}.label`) },
        value: { text: valueText },
        actions: { items: [change(changeHref, `rows.${field}.changeHidden`)] },
      });
    }
  };

  const copyOfTenancyAgreement =
    getFormDataString(req, 'have-tenancy-agreement', 'copyOfTenancyAgreement') ??
    tenancyDetails?.copyOfTenancyAgreement;
  addRow(
    'copyOfTenancyAgreement',
    copyOfTenancyAgreement,
    'have-tenancy-agreement',
    copyOfTenancyAgreement && t(`rows.copyOfTenancyAgreement.options.${copyOfTenancyAgreement}`)
  );

  const noTenancyAgreementReason =
    getFormDataString(req, 'have-tenancy-agreement', 'copyOfTenancyAgreement.noTenancyAgreementReason') ??
    tenancyDetails?.noTenancyAgreementReason;
  if (copyOfTenancyAgreement === 'No') {
    addRow('noTenancyAgreementReason', noTenancyAgreementReason, 'have-tenancy-agreement');
  }

  if (copyOfTenancyAgreement === 'Yes') {
    const documents = getFormData(req, 'upload-tenancy-agreement').documents as DisplayDocument[] | undefined;
    const filename = documents?.[0]?.document_filename ?? tenancyDetails?.tenancyAgreementDocument?.filename;
    addRow('tenancyAgreementDocument', filename, 'upload-tenancy-agreement');
  }

  return rows;
}
