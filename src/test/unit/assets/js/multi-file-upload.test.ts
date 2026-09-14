/**
 * @jest-environment jsdom
 */
import { MultiFileUpload } from '@ministryofjustice/frontend';

import { initMultiFileUpload } from '../../../../main/assets/js/multi-file-upload';

jest.mock('@ministryofjustice/frontend', () => ({
  MultiFileUpload: jest.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.uploadFile = jest.fn();
  }),
}));

const mockedMultiFileUpload = MultiFileUpload as unknown as jest.Mock;

const UPLOAD_URL = '/1234123412341234/documents/floorPlanDocument/upload';
const DELETE_URL = '/1234123412341234/documents/floorPlanDocument/delete';

interface Hooks {
  exitHook: (instance: unknown, file: File, xhr: XMLHttpRequest, statusText: string) => void;
  errorHook: (instance: unknown, file: File, xhr: XMLHttpRequest, statusText: string, error: Error) => void;
  deleteHook: (instance: unknown, file: File | undefined, xhr: XMLHttpRequest, statusText: string) => void;
}

const render = (serverErrorSummary = false, multiple = false): void => {
  document.body.innerHTML = `
    <main>
      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
          ${
            serverErrorSummary
              ? `<div class="govuk-error-summary" data-module="govuk-error-summary">
                   <div role="alert">
                     <h2 class="govuk-error-summary__title">There is a problem</h2>
                     <div class="govuk-error-summary__body">
                       <ul class="govuk-list govuk-error-summary__list">
                         <li><a href="#documents">Select a floor plan of the property to upload</a></li>
                       </ul>
                     </div>
                   </div>
                 </div>`
              : ''
          }
          <h1 class="govuk-heading-l">Upload a floor plan of the property</h1>
          <form method="post" action="/1234123412341234/upload-floor-plan-of-property">
            <div class="moj-multi-file-upload"
                 data-module="moj-multi-file-upload"
                 data-upload-url="${UPLOAD_URL}"
                 data-delete-url="${DELETE_URL}"
                 data-accept=".pdf,.jpg"
                 data-max-file-size-mb="100"
                 data-max-filename-length="255"
                 data-error-wrong-file-type="This file type is not accepted"
                 data-error-file-too-large="This file is too large"
                 data-error-filename-too-long="This file name is too long"
                 data-error-delete="This file could not be removed"
                 data-error-only-one-file="You can only upload one file"
                 data-error-remove-file-first="Remove the uploaded file before adding another"
                 data-error-summary-title="There is a problem"
                 data-error-prefix="Error:"
                 data-choose-file-text="Choose file"
                 data-drop-file-text="or drop file"
                 data-multiple="${multiple}">
              <div class="govuk-form-group">
                <label class="govuk-label" for="documents">Upload a floor plan</label>
                <div class="moj-multi-file-upload__dropzone">
                  <input class="moj-multi-file-upload__input" id="documents" name="documents" type="file">
                  <p class="govuk-body">or drop file</p>
                  <label class="govuk-button govuk-button--secondary" for="documents">Choose file</label>
                </div>
              </div>
              <div class="moj-multi-file__uploaded-files" data-testid="feedback">
                <ul class="moj-multi-file-upload__list"></ul>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>`;
};

const start = (serverErrorSummary = false, multiple = false): void => {
  jest.clearAllMocks();
  render(serverErrorSummary, multiple);
  initMultiFileUpload();
};

const hooksOf = (): Hooks => mockedMultiFileUpload.mock.calls[0][1].hooks as Hooks;

const instance = (): { uploadFile: jest.Mock; uploadFiles: (files: File[]) => void } =>
  mockedMultiFileUpload.mock.instances[0] as unknown as {
    uploadFile: jest.Mock;
    uploadFiles: (files: File[]) => void;
  };

const upload = (...files: File[]): void => instance().uploadFiles(files);
const uploaded = (): jest.Mock => instance().uploadFile;

const container = (): HTMLElement => document.querySelector('.moj-multi-file-upload') as HTMLElement;
const summary = (): HTMLElement | null => document.querySelector('main .govuk-error-summary');
const summaryMessages = (): string[] =>
  Array.from(document.querySelectorAll('.govuk-error-summary__list li a')).map(a => a.textContent ?? '');
const inlineError = (): HTMLElement | null => document.querySelector('.govuk-error-message');
const formGroup = (): HTMLElement => document.querySelector('.govuk-form-group') as HTMLElement;
const fileInput = (): HTMLInputElement => document.getElementById('documents') as HTMLInputElement;

const fileOf = (name: string, sizeInBytes = 10): File => {
  const file = new File(['x'], name, { type: 'application/pdf' });
  Object.defineProperty(file, 'size', { value: sizeInBytes });
  return file;
};

const rowWith = (className: string, text: string): HTMLElement => {
  const row = document.createElement('li');
  row.className = 'moj-multi-file-upload__row';
  row.innerHTML = `<div class="moj-multi-file-upload__message"><span class="${className}">${text}</span></div>`;
  document.querySelector('.moj-multi-file-upload__list')?.append(row);
  return row;
};

const uploadedRow = (filename = 'floor-plan.pdf'): HTMLElement => rowWith('moj-multi-file-upload__success', filename);
const failedRow = (): HTMLElement => rowWith('moj-multi-file-upload__error', 'Upload failed');

const jsonXhr = (body: unknown, status = 400): XMLHttpRequest =>
  ({ status, response: body }) as unknown as XMLHttpRequest;

describe('initMultiFileUpload', () => {
  beforeEach(() => start());

  describe('checks made before uploading', () => {
    it('reports a file whose type is not accepted', () => {
      upload(fileOf('virus.exe'));

      expect(summaryMessages()).toEqual(['This file type is not accepted']);
      expect(uploaded()).not.toHaveBeenCalled();
    });

    it('reports a file over the size cap', () => {
      upload(fileOf('floor-plan.pdf', 101 * 1024 * 1024));

      expect(summaryMessages()).toEqual(['This file is too large']);
      expect(uploaded()).not.toHaveBeenCalled();
    });

    it('reports an over-long file name ahead of anything else', () => {
      upload(fileOf(`${'a'.repeat(256)}.exe`));

      expect(summaryMessages()).toEqual(['This file name is too long']);
    });

    it('uploads an acceptable file without an error', () => {
      upload(fileOf('floor-plan.pdf'));

      expect(summary()).toBeNull();
      expect(inlineError()).toBeNull();
      expect(uploaded()).toHaveBeenCalledTimes(1);
    });

    it('clears a previous error when the user picks another file', () => {
      upload(fileOf('virus.exe'));

      upload(fileOf('floor-plan.pdf'));

      expect(summary()?.hidden).toBe(true);
      expect(inlineError()).toBeNull();
    });
  });

  describe('the error summary', () => {
    it('marks the form group and links the message to the input', () => {
      upload(fileOf('virus.exe'));

      expect(formGroup().classList).toContain('govuk-form-group--error');
      expect(inlineError()?.id).toBe('documents-error');
      expect(fileInput().getAttribute('aria-describedby')).toBe('documents-error');
      expect(document.querySelector('.govuk-error-summary__list a')?.getAttribute('href')).toBe('#documents');
    });

    it('hides the visually hidden error prefix from the message text', () => {
      upload(fileOf('virus.exe'));

      expect(inlineError()?.querySelector('.govuk-visually-hidden')?.textContent).toBe('Error:');
    });

    it('sits above the page heading, where the server renders its own', () => {
      upload(fileOf('virus.exe'));

      const column = document.querySelector('.govuk-grid-column-two-thirds') as HTMLElement;
      expect(column.firstElementChild?.classList).toContain('govuk-error-summary');
    });

    it('shows one message at a time rather than accumulating them', () => {
      upload(fileOf('virus.exe'));
      upload(fileOf('another.exe'));

      expect(summaryMessages()).toHaveLength(1);
      expect(document.querySelectorAll('main .govuk-error-summary')).toHaveLength(1);
    });

    it('removes the aria-describedby it added once the error clears', () => {
      upload(fileOf('virus.exe'));

      hooksOf().exitHook(null, fileOf('floor-plan.pdf'), jsonXhr({}, 200), 'OK');

      expect(fileInput().hasAttribute('aria-describedby')).toBe(false);
      expect(formGroup().classList).not.toContain('govuk-form-group--error');
    });

    it('replaces the message in a server-rendered summary instead of adding a second', () => {
      start(true);

      upload(fileOf('virus.exe'));

      expect(document.querySelectorAll('main .govuk-error-summary')).toHaveLength(1);
      expect(summaryMessages()).toEqual(['This file type is not accepted']);
    });
  });

  describe('a single document field', () => {
    it('refuses several files dropped at once and uploads none of them', () => {
      upload(fileOf('one.pdf'), fileOf('two.pdf'));

      expect(summaryMessages()).toEqual(['You can only upload one file']);
      expect(uploaded()).not.toHaveBeenCalled();
    });

    it('refuses a second file once one is uploaded, and says to remove it first', () => {
      uploadedRow();

      upload(fileOf('another.pdf'));

      expect(summaryMessages()).toEqual(['Remove the uploaded file before adding another']);
      expect(uploaded()).not.toHaveBeenCalled();
    });

    it('accepts a file again once the uploaded one is removed', () => {
      const row = uploadedRow();
      upload(fileOf('another.pdf'));
      expect(uploaded()).not.toHaveBeenCalled();

      row.remove();
      upload(fileOf('replacement.pdf'));

      expect(uploaded()).toHaveBeenCalledTimes(1);
    });

    it('does not count a failed row as an uploaded document', () => {
      failedRow();

      upload(fileOf('floor-plan.pdf'));

      expect(uploaded()).toHaveBeenCalledTimes(1);
    });
  });

  describe('a collection field', () => {
    beforeEach(() => start(false, true));

    it('accepts several files at once', () => {
      upload(fileOf('one.pdf'), fileOf('two.pdf'), fileOf('three.pdf'));

      expect(summary()).toBeNull();
      expect(uploaded()).toHaveBeenCalledTimes(3);
    });

    it('keeps accepting files after one is uploaded', () => {
      uploadedRow();

      upload(fileOf('another.pdf'));

      expect(summary()).toBeNull();
      expect(uploaded()).toHaveBeenCalledTimes(1);
    });

    it('reports a rejected file without stopping the rest of the batch', () => {
      upload(fileOf('virus.exe'), fileOf('floor-plan.pdf'));

      expect(summaryMessages()).toEqual(['This file type is not accepted']);
      expect(uploaded()).toHaveBeenCalledTimes(1);
    });
  });

  describe('failures reported by the server', () => {
    it('shows the message it returned and drops the failed row', () => {
      failedRow();

      hooksOf().errorHook(
        null,
        fileOf('floor-plan.pdf'),
        jsonXhr({ error: { message: 'Remove the uploaded file before adding another' } }),
        'Bad Request',
        new Error('rejected')
      );

      expect(summaryMessages()).toEqual(['Remove the uploaded file before adding another']);
      expect(document.querySelectorAll('.moj-multi-file-upload__row')).toHaveLength(0);
    });

    it('leaves the row alone when the failure carries no message', () => {
      failedRow();

      hooksOf().errorHook(null, fileOf('floor-plan.pdf'), jsonXhr(null, 500), 'Server Error', new Error('failed'));

      expect(summary()).toBeNull();
      expect(document.querySelectorAll('.moj-multi-file-upload__row')).toHaveLength(1);
    });
  });

  describe('a successful upload', () => {
    it('clears the error and removes any failed rows', () => {
      upload(fileOf('virus.exe'));
      failedRow();

      hooksOf().exitHook(null, fileOf('floor-plan.pdf'), jsonXhr({}, 200), 'OK');

      expect(summary()?.hidden).toBe(true);
      expect(document.querySelectorAll('.moj-multi-file-upload__row')).toHaveLength(0);
    });
  });

  describe('removing a document', () => {
    it('reports a delete that did not succeed', () => {
      hooksOf().deleteHook(null, undefined, jsonXhr(null, 500), 'Server Error');

      expect(summaryMessages()).toEqual(['This file could not be removed']);
    });

    it('clears any error once the delete succeeds', () => {
      upload(fileOf('virus.exe'));

      hooksOf().deleteHook(null, undefined, jsonXhr(null, 200), 'OK');

      expect(summary()?.hidden).toBe(true);
    });
  });

  describe('the files added list', () => {
    const feedback = (): HTMLElement => document.querySelector('[data-testid="feedback"]') as HTMLElement;

    it('stays hidden when the file is rejected before it is uploaded', () => {
      upload(fileOf('virus.exe'));

      expect(feedback().classList).toContain('moj-hidden');
    });

    it('stays hidden when several files are dropped on a single document field', () => {
      upload(fileOf('one.pdf'), fileOf('two.pdf'));

      expect(feedback().classList).toContain('moj-hidden');
    });

    it('hides again once a failed row is cleared', () => {
      failedRow();
      expect(feedback().classList).not.toContain('moj-hidden');

      hooksOf().errorHook(
        null,
        fileOf('floor-plan.pdf'),
        jsonXhr({ error: { message: 'This file could not be uploaded' } }),
        'Bad Request',
        new Error('failed')
      );

      expect(feedback().classList).toContain('moj-hidden');
    });

    it('shows while a document is listed', () => {
      uploadedRow();
      upload(fileOf('another.pdf'));

      expect(feedback().classList).not.toContain('moj-hidden');
    });

    it('hides when the last document is removed alongside a failed row', () => {
      const row = uploadedRow();
      failedRow();

      row.remove();
      document.querySelectorAll('.moj-multi-file-upload__row').forEach(r => r.remove());
      hooksOf().deleteHook(null, undefined, jsonXhr(null, 200), 'OK');

      expect(feedback().classList).toContain('moj-hidden');
    });
  });

  describe('the dropzone', () => {
    it('puts the button before the hint', () => {
      const dropzone = document.querySelector('.moj-multi-file-upload__dropzone') as HTMLElement;
      const children = Array.from(dropzone.children).map(child => child.tagName);

      expect(children.indexOf('LABEL')).toBeLessThan(children.indexOf('P'));
    });

    it('moves the hint spacing to the side it now sits on', () => {
      const hint = document.querySelector('.moj-multi-file-upload__dropzone p') as HTMLElement;

      expect(hint.classList).toContain('govuk-!-margin-right-0');
      expect(hint.classList).toContain('govuk-!-margin-left-2');
    });

    it('names the button and the hint from the page', () => {
      const config = mockedMultiFileUpload.mock.calls[0][1];

      expect(config.dropzoneButtonText).toBe('Choose file');
      expect(config.dropzoneHintText).toBe('or drop file');
    });
  });

  describe('containers it should ignore', () => {
    it('does nothing without an upload URL', () => {
      jest.clearAllMocks();
      render();
      container().removeAttribute('data-upload-url');

      expect(initMultiFileUpload()).toHaveLength(0);
      expect(mockedMultiFileUpload).not.toHaveBeenCalled();
    });
  });
});
