import { flowConfig } from '../../flow.config';

import { readDocuments, toDisplayDocuments } from '@modules/documents/storage';
import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { ACCEPT_ATTRIBUTE_EXTENSIONS } from '@utils/documentUploadValidation';

const journeyName = 'application';
const stepName = 'upload-floor-plan-of-property';
const documentField = 'floorPlanDocuments';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/uploadFloorPlanOfProperty.njk`,
  showCancelButton: false,
  documentField,
  isAnswered: req => Boolean(req.session.ccdCase?.propertyDetails?.floorPlanDocuments?.some(doc => doc.url)),
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
    subHeading: 'subHeading',
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
