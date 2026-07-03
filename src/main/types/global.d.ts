import { type Session, type SessionData } from 'express-session';
import { type Environment } from 'nunjucks';
import { type TFunction } from 'i18next';

interface CustomSessionData extends SessionData {
  codeVerifier?: string;
  nonce?: string;
  user?: UserInfoResponseWithToken;
  returnTo?: string;
  formData?: Record<string, any>;
  uploadedDocs?: Record<string, Record<string, unknown[]>>;
  returnToCya?: string;
  lastVisitedStep?: string;
  ccdCase?: CcdCase;
  genApp?: {
    applicationId?: string;
    showDuplicateSubmissionPage?: boolean;
  };
  destroy(callback: (err?: Error) => void): void;
}

declare module 'express-session' {
  interface SessionData extends CustomSessionData {}
}

declare module 'express' {
  interface Request {
    language: string;
    t: TFunction;
    i18n: import('i18next').default;
    session: Session & CustomSessionData;
    csrfToken?: () => string;
  }

  interface Response {
    locals: {
      validatedCase?: CcdCaseModel;
      t?: TFunction;
      lang?: string;
    } & Record<string, unknown>;
    csrfToken?: () => string;
  }

  interface Application {
    locals: {
      developmentMode?: boolean;
      nunjucksEnv?: Environment;
      ENV?: string;
    };
  }
}

export {};
