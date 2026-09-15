import axios from 'axios';
import config from 'config';
import { TOTP } from 'otpauth';

import { Logger } from '@modules/logger';

const logger = Logger.getLogger('service-auth-token');

const REFRESH_INTERVAL_MS = 1000 * 60 * 60;
const RETRY_INTERVAL_MS = 1000 * 60;
const REQUEST_TIMEOUT_MS = 10_000;

let token: string;
let refreshTimer: NodeJS.Timeout | undefined;

export const getTokenFromApi = async (): Promise<boolean> => {
  logger.info('Refreshing service auth token');

  const url: string = config.get('authProvider.url') + '/lease';
  const microservice: string = config.get('authProvider.microservice');
  const secret: string = config.get('authProvider.secret');
  const oneTimePassword = createOneTimePassword(secret);
  const body = { microservice, oneTimePassword };

  try {
    const response = await axios.post(url, body, { timeout: REQUEST_TIMEOUT_MS });
    token = response.data;
    return true;
  } catch (err) {
    logger.error('Failed to refresh service auth token', err.response?.status ?? err.code, err.response?.data);
    return false;
  }
};

const createOneTimePassword = (secret: string): string => {
  const totp = new TOTP({
    secret,
    digits: 6,
    period: 30,
  });

  return totp.generate();
};

const scheduleRefresh = (delayMs: number): void => {
  stopAuthTokenRefresh();
  refreshTimer = setTimeout(async () => {
    const refreshed = await getTokenFromApi();
    scheduleRefresh(refreshed ? REFRESH_INTERVAL_MS : RETRY_INTERVAL_MS);
  }, delayMs);
  refreshTimer.unref();
};

export const initAuthToken = async (): Promise<void> => {
  const refreshed = await getTokenFromApi();
  scheduleRefresh(refreshed ? REFRESH_INTERVAL_MS : RETRY_INTERVAL_MS);
};

export const stopAuthTokenRefresh = (): void => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = undefined;
  }
};

export const requireServiceAuthToken = (): string => {
  if (!token) {
    throw new Error('No S2S token available — the service auth token refresh has failed');
  }
  return token;
};
