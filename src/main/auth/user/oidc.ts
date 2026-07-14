import axios, { AxiosResponse } from 'axios';
import config from 'config';
import { jwtDecode } from 'jwt-decode';
import NodeCache from 'node-cache';

import { CALLBACK_URL } from '../../urls';

import { Logger } from '@modules/logger';

const logger = Logger.getLogger('login routes');

export const idamTokenCache = new NodeCache({ stdTTL: 3600, checkperiod: 1800 });

export const getRedirectUrl = (serviceUrl: string): string => {
  const id: string = config.get('idam.clientID');
  const loginUrl: string = config.get('idam.authorizationURL');
  const callbackUrl = encodeURI(serviceUrl + CALLBACK_URL);

  return `${loginUrl}?client_id=${id}&response_type=code&redirect_uri=${callbackUrl}`;
};

export const getUserDetails = async (serviceUrl: string, rawCode: string): Promise<UserDetails> => {
  const callbackUrl = encodeURI(serviceUrl + CALLBACK_URL);
  const code = encodeURIComponent(rawCode);
  const params = { callbackUrl, code };

  const response: AxiosResponse<OidcResponse> = await getIdamToken(params, params.code);
  const jwt = jwtDecode(response.data.id_token) as IdTokenJwtPayload;

  return {
    accessToken: response.data.access_token,
    id: jwt.uid,
    email: jwt.sub,
    givenName: jwt.given_name,
    familyName: jwt.family_name,
    roles: jwt.roles,
  };
};

export const getSystemUser = async (): Promise<UserDetails> => {
  const username: string = config.get('idam.systemUsername');
  const password: string = config.get('idam.systemPassword');
  const params = { username, password };

  const response: AxiosResponse<OidcResponse> = await createIdamToken(params);

  const jwt = jwtDecode(response.data.id_token) as IdTokenJwtPayload;

  return {
    accessToken: response.data.access_token,
    id: jwt.uid,
    email: jwt.sub,
    givenName: jwt.given_name,
    familyName: jwt.family_name,
    roles: jwt.roles,
  };
};

const createIdamToken = (params: Record<string, string>): Promise<AxiosResponse<OidcResponse>> => {
  const id: string = config.get('idam.clientID');
  const secret: string = config.get('idam.clientSecret');
  const tokenUrl: string = config.get('idam.tokenURL');
  const headers = { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' };

  let data: string;
  if (params.username && params.password) {
    data = `grant_type=password&username=${params.username}&password=${params.password}&client_id=${id}&client_secret=${secret}&scope=openid%20profile%20roles%20openid%20roles%20profile`;
  } else if (params.callbackUrl && params.code) {
    data = `client_id=${id}&client_secret=${secret}&grant_type=authorization_code&redirect_uri=${params.callbackUrl}&code=${params.code}`;
  } else {
    throw new Error('Missing data for createIdamToken.');
  }
  return axios.post(tokenUrl, data, { headers });
};

export const getIdamToken = async (
  params: Record<string, string>,
  cacheKey: string
): Promise<AxiosResponse<OidcResponse>> => {
  let response: AxiosResponse<OidcResponse>;
  const isCachingEnabled = String(config.get('idam.caching')) === 'true';
  const cached = idamTokenCache.get(cacheKey) as AxiosResponse<OidcResponse> | undefined;
  if (isCachingEnabled && cached) {
    response = cached;
  } else if (isCachingEnabled) {
    logger.info('Generating access token and then caching it');
    response = await createIdamToken(params);
    idamTokenCache.set(cacheKey, {
      data: { id_token: response.data.id_token, access_token: response.data.access_token },
    });
  } else {
    response = await createIdamToken(params);
  }
  return response;
};

export interface UserDetails {
  accessToken: string;
  id: string;
  email: string;
  givenName: string;
  familyName: string;
  roles: string[];
}

export interface OidcResponse {
  id_token: string;
  access_token: string;
}

interface IdTokenJwtPayload {
  uid: string;
  sub: string;
  given_name: string;
  family_name: string;
  roles: string[];
}
