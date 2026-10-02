import { promises as fs } from 'fs';
import path from 'path';

import type { Request } from 'express';
import type { TFunction } from 'i18next';

import {
  type AllowedLang,
  findLocalesDir,
  getRequestLanguage as getMainRequestLanguage,
  getTranslationFunction as getMainTranslationFunction,
} from '../i18n';

import { Logger } from '@modules/logger';
import { isDiagnosticsEnabled } from '@utils/environment';

const logger = Logger.getLogger('i18n');

export type TranslationContent = Record<string, unknown>;

export type SupportedLang = AllowedLang;

function camelizeStepName(stepName: string): string {
  return stepName
    .split('-')
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');
}

/**
 * Identity for a step's translations. Used as both the locales filesystem path
 * (under `locales/<lang>/`) and the i18next namespace — one identity, one
 * function. The journey folder is required so that two journeys with the same
 * step name (e.g. two `start-now` steps) get distinct namespaces and don't
 * share a single mutable bundle.
 */
export function getStepTranslationPath(stepName: string, folder: string): string {
  return `${folder}/${camelizeStepName(stepName)}`;
}

/**
 * Loads and registers the current step's translations under a journey-scoped
 * i18next namespace. The step is read from `res.locals.step` (set by
 * `withStepContext` middleware); outside a step request the call is a no-op.
 *
 * The resource-bundle cache check is safe because the namespace is unique per
 * (journey, step), so the first request warms it and subsequent requests skip
 * the disk read.
 */
export async function loadStepNamespace(req: Request): Promise<void> {
  if (!req.i18n) {
    return;
  }

  const step = req.res?.locals.step;
  if (!step) {
    return;
  }

  const stepNamespace = getStepTranslationPath(step.name, step.journey);
  const lang = getMainRequestLanguage(req);

  if (req.i18n.getResourceBundle(lang, stepNamespace)) {
    return;
  }

  const localesDir = await findLocalesDir();
  if (!localesDir) {
    if (isDiagnosticsEnabled()) {
      logger.warn(`Locales directory not found. Translation file for ${step.name} will not be loaded.`);
    }
    return;
  }

  try {
    const resolvedLocalesDir = path.resolve(localesDir);
    const resolvedPath = path.resolve(localesDir, lang, `${stepNamespace}.json`);

    if (!resolvedPath.startsWith(resolvedLocalesDir)) {
      if (isDiagnosticsEnabled()) {
        logger.warn(`Invalid translation path detected: ${stepNamespace}`);
      }
      return;
    }

    await fs.access(resolvedPath);
    const translations = JSON.parse(await fs.readFile(resolvedPath, 'utf8')) as Record<string, unknown>;

    if (Object.keys(translations).length === 0) {
      return;
    }

    req.i18n.addResourceBundle(lang, stepNamespace, translations, true, true);

    await new Promise<void>((resolve, reject) => {
      req.i18n!.loadNamespaces(stepNamespace, (err: Error) => (err ? reject(err) : resolve()));
    });
  } catch (error) {
    if (isDiagnosticsEnabled()) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('ENOENT')) {
        logger.error(`Failed to load translation file for ${step.name}:`, error);
      }
    }
  }
}

/** Reads the current step's translation bundle (empty when outside a step request). */
export function getStepTranslations(req: Request): TranslationContent {
  if (!req.i18n) {
    return {};
  }

  const step = req.res?.locals.step;
  if (!step) {
    return {};
  }

  const lang = getMainRequestLanguage(req);
  const resources = req.i18n.getResourceBundle(lang, getStepTranslationPath(step.name, step.journey));
  return (resources as TranslationContent) || {};
}

/**
 * Translation function for a request. When a step context is set on
 * `res.locals.step` the step's namespace is prepended to `namespaces`;
 * otherwise this falls back to the common-only main translation function.
 */
export function getTranslationFunction(req: Request, namespaces: string[] = ['common']): TFunction {
  if (!req.i18n) {
    return getMainTranslationFunction(req, namespaces);
  }

  const step = req.res?.locals.step;
  const lang = getMainRequestLanguage(req);
  const allNamespaces = step ? [getStepTranslationPath(step.name, step.journey), ...namespaces] : namespaces;
  const fixedT = req.i18n.getFixedT(lang, allNamespaces);
  return fixedT || getMainTranslationFunction(req, namespaces);
}

/** Validates and warns about missing translation keys in development. */
export function validateTranslationKey(t: TFunction, key: string, context?: string): void {
  if (isDiagnosticsEnabled()) {
    const translation = t(key);
    if (translation === key) {
      logger.warn(`Missing translation key: "${key}"${context ? ` in ${context}` : ''}`);
    }
  }
}
