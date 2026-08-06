import axios from 'axios';
import config from 'config';
import { TOTP } from 'otpauth';

import { Logger } from '@modules/logger';

const logger = Logger.getLogger('service-auth-token');
let token: string;

export const getTokenFromApi = async (): Promise<void> => {
  logger.info('Refreshing service auth token');

  const url: string = config.get('authProvider.url') + '/lease';
  const microservice: string = config.get('authProvider.microservice');
  const secret: string = config.get('authProvider.secret');
  const oneTimePassword = createOneTimePassword(secret);
  const body = { microservice, oneTimePassword };

  try {
    const response = await axios.post(url, body);
    token = response.data;
  } catch (err) {
    logger.error(err.response?.status, err.response?.data);
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

export const initAuthToken = async (): Promise<void> => {
  await getTokenFromApi();
  setInterval(getTokenFromApi, 1000 * 60 * 60);
};

export const getServiceAuthToken = (): string => {
  return token;
};
