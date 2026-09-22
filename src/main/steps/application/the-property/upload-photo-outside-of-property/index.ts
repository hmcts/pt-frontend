import { flowConfig } from '../../flow.config';

import { readDocuments, toDisplayDocuments } from '@modules/documents/storage';
import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { ACCEPT_ATTRIBUTE_EXTENSIONS } from '@utils/documentUploadValidation';

const journeyName = 'application';
const stepName = 'upload-photo-outside-of-property';
const documentField = 'outsidePropertyDocument';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/uploadPhotoOutsideOfProperty.njk`,
  showCancelButton: false,
  documentField,
  isAnswered: () => true,
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
    subHeading: 'subheading',
  },
  fields: [
    {
      name: 'documents',
      type: 'file',
      required: false,
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
