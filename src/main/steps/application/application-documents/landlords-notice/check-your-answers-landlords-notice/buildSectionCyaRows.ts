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
  const noticeDetails = validatedCase?.noticeOfRentIncreaseDetails;

  const addRow = (field: string, value: string | undefined, changeHref: string, valueText: string = value ?? '') => {
    if (value) {
      rows.push({
        key: { text: t(`rows.${field}.label`) },
        value: { text: valueText },
        actions: { items: [change(changeHref, `rows.${field}.changeHidden`)] },
      });
    }
  };

  const receivedLandlordNoticeProposingNewRent =
    getFormDataString(req, 'have-landlords-notice', 'receivedLandlordNoticeProposingNewRent') ??
    (noticeDetails?.receivedLandlordNoticeProposingNewRent as string | undefined);
  addRow(
    'receivedLandlordNoticeProposingNewRent',
    receivedLandlordNoticeProposingNewRent,
    'have-landlords-notice',
    receivedLandlordNoticeProposingNewRent &&
      t(`rows.receivedLandlordNoticeProposingNewRent.options.${receivedLandlordNoticeProposingNewRent}`)
  );
  const noUploadOfNoticeProposingNewRentReason =
    getFormDataString(
      req,
      'have-landlords-notice',
      'receivedLandlordNoticeProposingNewRent.noUploadOfNoticeProposingNewRentReason'
    ) ?? noticeDetails?.noUploadOfNoticeProposingNewRentReason;
  if (receivedLandlordNoticeProposingNewRent === 'No') {
    addRow('noUploadOfNoticeProposingNewRentReason', noUploadOfNoticeProposingNewRentReason, 'have-landlords-notice');
  }

  if (receivedLandlordNoticeProposingNewRent === 'Yes') {
    const documents = getFormData(req, 'upload-landlords-notice').documents as DisplayDocument[] | undefined;
    const filename =
      documents?.[0]?.document_filename ?? noticeDetails?.landlordNoticeProposingNewRentDocument?.filename;
    addRow('landlordNoticeProposingNewRentDocument', filename, 'upload-landlords-notice');
  }

  const noticeLegallyValid =
    getFormDataString(req, 'your-notice-proposing-a-new-rent', 'noticeLegallyValid') ??
    noticeDetails?.noticeLegallyValid;
  addRow(
    'noticeLegallyValid',
    noticeLegallyValid,
    'your-notice-proposing-a-new-rent',
    noticeLegallyValid && t(`rows.noticeLegallyValid.options.${noticeLegallyValid}`)
  );

  const noticeNotLegallyValidDetails =
    getFormDataString(req, 'your-notice-proposing-a-new-rent', 'noticeLegallyValid.noticeNotLegallyValidDetails') ??
    noticeDetails?.noticeNotLegallyValidDetails;

  if (noticeLegallyValid === 'No') {
    addRow('noticeNotLegallyValidDetails', noticeNotLegallyValidDetails, 'your-notice-proposing-a-new-rent');

    const documents = getFormData(req, 'upload-evidence-notice-not-legally-valid').documents as
      | DisplayDocument[]
      | undefined;
    const filenames =
      documents?.map(doc => doc.document_filename).join(', ') ||
      noticeDetails?.noticeNotLegallyValidDocuments?.map(doc => doc.filename).join(', ');
    addRow('noticeNotLegallyValidDocuments', filenames, 'upload-evidence-notice-not-legally-valid');
  }

  const rentIncreaseToCauseHardship =
    getFormDataString(req, 'hardship', 'rentIncreaseToCauseHardship') ?? noticeDetails?.rentIncreaseToCauseHardship;
  addRow(
    'rentIncreaseToCauseHardship',
    rentIncreaseToCauseHardship,
    'hardship',
    rentIncreaseToCauseHardship && t(`rows.rentIncreaseToCauseHardship.options.${rentIncreaseToCauseHardship}`)
  );

  if (rentIncreaseToCauseHardship === 'Yes') {
    const rentIncreaseToCauseHardshipDetails =
      getFormDataString(req, 'hardship', 'rentIncreaseToCauseHardship.rentIncreaseToCauseHardshipDetails') ??
      noticeDetails?.rentIncreaseToCauseHardshipDetails;
    addRow('rentIncreaseToCauseHardshipDetails', rentIncreaseToCauseHardshipDetails, 'hardship');

    const documents = getFormData(req, 'upload-evidence-experience-hardship').documents as
      | DisplayDocument[]
      | undefined;
    const filenames =
      documents?.map(doc => doc.document_filename).join(', ') ||
      noticeDetails?.rentIncreaseToCauseHardshipDocuments?.map(doc => doc.filename).join(', ');
    addRow('rentIncreaseToCauseHardshipDocuments', filenames, 'upload-evidence-experience-hardship');
  }

  return rows;
}
