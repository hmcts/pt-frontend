const ACCESS_CODE_PATTERN = /^[A-HJ-NPR-TV-Z2-9]{12}$/;

export const normaliseAccessCode = (input: string): string => input.replace(/[\s-]/g, '').toUpperCase();
export const isValidAccessCode = (input: string): boolean => ACCESS_CODE_PATTERN.test(normaliseAccessCode(input));
