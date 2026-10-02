import { flowConfig } from '../../../flow.config';

import { acceptFor, maxFileSizeMBFor } from '@modules/documents/documentFields';
import { readDocuments, toDisplayDocuments } from '@modules/documents/storage';
import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'upload-evidence-proposed-market-rent';
const documentField = 'suggestedMarketRentEvidence';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/uploadEvidenceProposedMarketRent.njk`,
  showCancelButton: false,
  documentField,
  translationKeys: { pageTitle: 'pageTitle' },
  fields: [
    {
      name: 'documents',
      type: 'file',
      required: false,
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
