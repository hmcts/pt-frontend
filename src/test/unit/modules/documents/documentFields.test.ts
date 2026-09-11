import { DOCUMENT_FIELDS, documentFieldFor } from '@modules/documents/documentFields';

const entries = Object.entries(DOCUMENT_FIELDS);

describe('DOCUMENT_FIELDS', () => {
  test.each(entries)('%s names a CCD field that is not prefixed with its slice', (_key, field) => {
    expect(field.ccdField.startsWith(field.slice)).toBe(false);
    expect(field.ccdField).not.toHaveLength(0);
  });

  test('gives every field its own document type', () => {
    const types = entries.map(([, field]) => field.documentType);

    expect(new Set(types).size).toBe(types.length);
  });

  test('gives every field its own CCD field', () => {
    const ccdFields = entries.map(([, field]) => field.ccdField);

    expect(new Set(ccdFields).size).toBe(ccdFields.length);
  });

  test.each(entries)('%s names a pt-api field', (_key, field) => {
    expect(field.ptApiField).not.toHaveLength(0);
  });
});

describe('documentFieldFor', () => {
  test('finds a field the registry declares', () => {
    expect(documentFieldFor('floorPlanDocument')).toBe(DOCUMENT_FIELDS.floorPlanDocument);
  });

  test('returns nothing for a field it does not, so callers can reject it', () => {
    expect(documentFieldFor('somethingElse')).toBeUndefined();
  });
});
