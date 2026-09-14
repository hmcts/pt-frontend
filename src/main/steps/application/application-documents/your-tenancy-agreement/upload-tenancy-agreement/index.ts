import { flowConfig } from '../../../flow.config';

import { readDocuments, toDisplayDocuments } from '@modules/documents/storage';
import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { ACCEPT_ATTRIBUTE_EXTENSIONS } from '@utils/documentUploadValidation';

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
  isAnswered: req => {
    const application = req.session.ccdCase as {
      tenancyAgreementDetails?: { tenancyAgreementDocument?: { url?: string } };
    };
    return Boolean(application?.tenancyAgreementDetails?.tenancyAgreementDocument?.url);
  },
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
  },
  fields: [
    {
      name: 'documents',
      type: 'file',
      required: true,
      accept: ACCEPT_ATTRIBUTE_EXTENSIONS,
      isPageHeading: false,
      labelClasses: 'govuk-body',
      translationKey: { label: 'documentUpload.label' },
    },
  ],
  getInitialFormData: async req => ({
    documents: toDisplayDocuments(await readDocuments(req, documentField)),
  }),
});
