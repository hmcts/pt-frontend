import { type SessionData } from 'express-session';

/**
 * Reference: pcs-frontend/src/types/global.d.ts
 * TODO: HDPD-501
 */
interface CustomSessionData extends SessionData {
  formData?: Record<string, unknown>;
}

declare module 'express-session' {
  interface SessionData extends CustomSessionData {}
}

export {};
