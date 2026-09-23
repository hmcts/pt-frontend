import { flowConfig } from '../../flow.config';

import { readDocuments, toDisplayDocuments } from '@modules/documents/storage';
import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { ACCEPT_ATTRIBUTE_EXTENSIONS } from '@utils/documentUploadValidation';

const journeyName = 'application';
const stepName = 'upload-photo-of-each-room';
const documentField = 'propertyRoomsDocuments';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/uploadPhotoOfEachRoom.njk`,
  showCancelButton: false,
  documentField,
  isAnswered: req => {
    const application = req.session.ccdCase as {
      propertyDetails?: { propertyRoomsDocuments?: { url?: string }[] };
    };
    const docs = application?.propertyDetails?.propertyRoomsDocuments;
    return Array.isArray(docs) && docs.length > 0;
  },
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
    subHeading: 'subHeading',
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
