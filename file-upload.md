# Adding an upload page

Everything the pt-frontend needs for a new document upload step. The pt-api model and CCD
definition are covered separately.

A page uploads straight to CDAM from the browser, then saves the reference against the case
through a real CCD event. Errors, validation and single-document enforcement all come from the
shared machinery, so a new page is mostly configuration.

Reference implementation:
`src/main/steps/application/the-property/upload-floor-plan-of-property/`

## Before you start

Two values in your registry entry must match pt-api's generated definition exactly. Get them
from the definition:

```bash
# in pt-api
./gradlew generateCCDConfig

# the field name, inside the slice's complex type
build/definitions/PT/ComplexTypes/PropertyDetails.json

# the document type code
build/definitions/PT/FixedLists/DocumentType.json
```

> **Potential issues to watch out for -** An incorrect `ccdField` will result in a **404** error - `No matching caseField`.
> A `documentType` that is not present in the DocumentType.java enum will result in a **422** error. Neither is caught by any test
> in this repo: the frontend can't see pt-api's model, so issues surface only in a deployed environment.

## 1. Register the document field

`src/main/modules/documents/documentFields.ts`

```ts
tenancyAgreementDocument: {
  slice: 'propertyDetails',
  ptApiField: 'tenancyAgreementDocument',
  ccdField: 'tenancyAgreementDocument',
  documentType: 'tenancyAgreement',
},
```

Add `multiple: true` for a collection field. Leave it off for a single document — the absence is
what enforces one file.

| Property       | What it addresses                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `slice`        | The complex field on the case — `propertyDetails` or `noticeOfRentIncreaseDetails`                                       |
| `ptApiField`   | The name in pt-api's read API (mapped by ApplicationMapper.java), used when loading existing documents                   |
| `ccdField`     | The name inside the complex type (eg. `propertyDetails` or `noticeOfRentIncreaseDetails`), used when writing through CCD |
| `documentType` | The `DocumentType` enum sent with the document (full list found at DocumentType.java in pt-api)                          |
| `multiple`     | Optional. Collection field rather than a single document                                                                 |

## 2. Create the step

`src/main/steps/application/<section>/upload-tenancy-agreement/index.ts`

```ts
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
      propertyDetails?: { tenancyAgreementDocument?: { url?: string } };
    };
    return Boolean(application?.propertyDetails?.tenancyAgreementDocument?.url);
  },
  translationKeys: { pageTitle: 'pageTitle', heading: 'heading', subHeading: 'subHeading' },
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
```

`documentField` is typed to the registry's keys, so a typo is a compile error rather than a
runtime 500. The field is always named `documents`.

`required: true` works because the framework reads the saved documents onto the request body
before validation — the files never travel with the form, so without that the check would fail
even with a document attached.

## 3. Write the page template

`src/main/steps/application/<section>/upload-tenancy-agreement/uploadTenancyAgreement.njk`

```njk
{% extends "stepsTemplate.njk" %}
{% from "macros/stepButtons.njk" import stepButtons %}
{% from "macros/csrf.njk" import csrfProtection %}
{% from "macros/fileUploadMoj.njk" import fileUploadMoj %}
{% from "govuk/components/error-summary/macro.njk" import govukErrorSummary %}

{% block mainContent %}
  {% if errorSummary %}
    {{ govukErrorSummary(errorSummary) }}
  {% endif %}

  <h1 class="govuk-heading-l">{{ heading }}</h1>
  <p class="govuk-body">{{ t('subHeading') }}</p>

  <form method="post" action="{{ url }}" novalidate>
    {% for field in fields %}
      {% if field.componentType == 'fileUpload' %}
        {{ fileUploadMoj(field.component) }}
      {% endif %}
    {% endfor %}

    {{ stepButtons(saveAndContinue, saveForLater) }}
    {{ csrfProtection(csrfToken) }}
  </form>
{% endblock %}
```

## Single or multiple

One flag decides it, and four layers read it:

| Layer                | What `multiple` changes                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| The file input       | Whether the picker allows selecting several files                               |
| The upload component | Refuses a multi-file drop, and refuses a second file until the first is removed |
| The upload route     | Refuses a second file server-side, for anything that bypasses the browser       |
| The event payload    | `[{ value }]` for a collection, a bare object for a single document             |

> **Ensure consistency between pt-frontend and pt-api**
> Turning a page multiple also means pt-api models the field as `List<ListValue<UploadedDocument>>`, routes it to
> `updateMultipleDocuments`, maps it with `findDocumentsOfType`, and regenerates the definition.
> Flip the flag alone and the event fails at runtime.

## What is already configured

- Upload to CDAM and removal by row id, both through a real CCD event
- File type, size and filename validation, in the browser and again on the server
- A GOV.UK error summary with an inline field message, for every failure route
- The files-added list appearing only once a document is attached
- A required check on Save and continue when `required: true`
