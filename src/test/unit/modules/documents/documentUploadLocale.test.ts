import cyCommon from '../../../../main/assets/locales/cy/common.json';
import enCommon from '../../../../main/assets/locales/en/common.json';

const LABELS = ['label', 'uploadButton', 'filesAddedHeading', 'deleteButton', 'chooseFile', 'dropFile'];

const MESSAGES = [
  'wrongFileType',
  'fileTooLarge',
  'filenameTooLong',
  'uploadFailed',
  'deleteFailed',
  'onlyOneFile',
  'removeFileFirst',
];

// Every upload page reads these, and the upload route resolves the messages without a step
// namespace, so they have to sit in common rather than in one page's file.
describe.each([
  ['en', enCommon],
  ['cy', cyCommon],
])('%s common translations', (_lang, common) => {
  test.each(LABELS)('names the upload component label %s', label => {
    expect(common.documentUpload[label as keyof typeof common.documentUpload]).toBeTruthy();
  });

  test.each(MESSAGES)('names the upload error %s', message => {
    expect(common.errors.documentUpload[message as keyof typeof common.errors.documentUpload]).toBeTruthy();
  });
});

describe('the two languages', () => {
  test('name the same upload component labels', () => {
    expect(Object.keys(cyCommon.documentUpload)).toEqual(Object.keys(enCommon.documentUpload));
  });

  test('name the same upload errors', () => {
    expect(Object.keys(cyCommon.errors.documentUpload)).toEqual(Object.keys(enCommon.errors.documentUpload));
  });
});
