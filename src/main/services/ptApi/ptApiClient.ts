import axios, { AxiosInstance } from 'axios';
import config from 'config';

import { getServiceAuthToken } from '../../auth/service/get-service-auth-token';
import { UserDetails } from '../../auth/user/oidc';
import { ApplicationData } from '../ccdCase.interface';

import { Logger } from '@modules/logger';

const logger = Logger.getLogger('service-auth-token');

export class PtApiClient {
  constructor(private readonly client: AxiosInstance) {}

  async getAllCasesByUser(): Promise<ApplicationData> {
    try {
      const response = await this.client.get<ApplicationData>('/applications');
      return response.data;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getCaseByCaseReference(caseReference: string): Promise<ApplicationData[]> {
    try {
      const response = await this.client.get<ApplicationData[]>(`/applications/${caseReference}`);
      return response.data;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

export const getPtApi = (userDetails: UserDetails): PtApiClient => {
  return new PtApiClient(
    axios.create({
      baseURL: config.get('api.url'),
      headers: {
        Authorization: 'Bearer ' + userDetails.accessToken,
        ServiceAuthorization: getServiceAuthToken(),
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    })
  );
};
