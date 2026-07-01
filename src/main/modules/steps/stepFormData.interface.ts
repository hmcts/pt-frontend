import { Request, RequestHandler } from 'express';

import type { AllowedLang } from '../i18n';

export type SupportedLang = AllowedLang;

// Placeholder — replace with GetController from @modules/steps (HDPD-506)
export interface GetController {
  get: RequestHandler;
}

export interface ErrorField {
  field: string;
  text: string;
}

export interface StepFormData {
  error?: ErrorField | string | undefined;
  answer?: string;
  choices?: string[] | string;
  [key: string]: unknown;
}

export interface StepDefinition {
  url: string;
  name: string;
  view: string;
  stepDir: string;
  getController: GetController | ((lang?: SupportedLang) => GetController);
  postController?: { post: RequestHandler };
  middleware?: RequestHandler[];
  showCancelButton?: boolean;
  // Truthy/falsy — consumers coerce. Lets `req => validatedCase?.foo` work without a Boolean(...) wrap.
  isAnswered?: (req: Request) => unknown;
}
