import { type Environment } from 'nunjucks';
import { type TFunction } from 'i18next';

declare module 'express' {
  interface Request {
    language: string;
    t: TFunction;
    i18n: import('i18next').default;
  }

  interface Response {
    locals: {
      t?: TFunction;
      lang?: string;
    } & Record<string, unknown>;
  }

  interface Application {
    locals: {
      nunjucksEnv?: Environment;
      ENV?: string;
    };
  }
}

export {};
