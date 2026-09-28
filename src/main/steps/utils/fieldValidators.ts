import { FilterXSS } from 'xss';

const STRIP_HTML_OPTIONS = {
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script'],
  // Preserve stray '<' / '>' (e.g. "1 bed < 2 beds") instead of escaping them to &lt;/&gt;.
  escapeHtml: (str: string) => str,
};

const htmlStripFilter = new FilterXSS(STRIP_HTML_OPTIONS);

// Only run xss when input looks like HTML. Single-quantifier regex with disjoint
// character classes => strictly linear, no ReDoS risk for CodeQL to flag.
const HTML_LIKE_PATTERN = /<[\s/]*[A-Za-z!]/;

export function looksLikeHtml(text: string): boolean {
  return HTML_LIKE_PATTERN.test(text);
}

export function stripHtmlTags(text: string): string {
  if (!looksLikeHtml(text)) {
    return text;
  }
  return htmlStripFilter.process(text);
}

/**
 * Validates whether a text area box has valid length
 * If the optional text box was left blank - isAnswered = true
 * If the optional text box was filled with text and is less than max value of 500 - isAnswered = true
 *
 * Called from two places with differently-shaped input: field validators run on the raw request
 * body, where a line break is still the submitted CRLF, and isAnswered checks run on stored data,
 * where processFieldData has already normalised it to LF. Normalising here makes both agree with
 * the character count the citizen was shown; it is a no operation for the stored case.
 *
 * @param value - string entered for given text box
 * @param max - maximum valid length
 */
export function textAreaIsValidLength(value: string | undefined, max = 500): boolean {
  return !value || String(value).replace(/\r\n?/g, '\n').length <= max;
}
