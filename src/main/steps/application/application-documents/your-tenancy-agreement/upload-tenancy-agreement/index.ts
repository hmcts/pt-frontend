import { flowConfig } from '../../../flow.config';

import { acceptFor, maxFileSizeMBFor } from '@modules/documents/documentFields';
import { readDocuments, toDisplayDocuments } from '@modules/documents/storage';
import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'upload-tenancy-agreement';
const documentField = 'tenancyAgreementDocument';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/uploadTenancyAgreement.njk`,
  showCancelButton: false,
  documentField,
  isAnswered: req => Boolean(req.session.ccdCase?.tenancyAgreementDetails?.tenancyAgreementDocument?.url),
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
  },
  fields: [
    {
      name: 'documents',
      type: 'file',
      required: true,
      accept: acceptFor(documentField),
      maxFileSize: maxFileSizeMBFor(documentField),
      isPageHeading: false,
      labelClasses: 'govuk-body',
      translationKey: { label: 'documentUpload.label' },
    },
  ],
  getInitialFormData: async req => ({
    documents: toDisplayDocuments(await readDocuments(req, documentField)),
  }),
});
