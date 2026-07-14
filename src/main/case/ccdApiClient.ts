import axios, { AxiosInstance, AxiosResponse } from 'axios';
import config from 'config';

import { getServiceAuthToken } from '../auth/service/get-service-auth-token';
import { UserDetails } from '../auth/user/oidc';

import { Case, CaseWithId } from './case';
import { CITIZEN_CREATE_CASE, CaseData } from './definition';

import { Logger } from '@modules/logger';

const logger = Logger.getLogger('service-auth-token');

export class CcdApiClient {
  readonly maxRetries: number = 3;
  readonly CASE_TYPE = config.get('ccd.caseTypeId');

  constructor(private readonly client: AxiosInstance) {}

  async createCase(data: Partial<Case>): Promise<CaseWithId> {
    try {
      const tokenResponse: AxiosResponse<CcdTokenResponse> = await this.client.get(
        `/case-types/${this.CASE_TYPE}/event-triggers/${CITIZEN_CREATE_CASE}`
      );
      const token = tokenResponse.data.token;
      const event = { id: CITIZEN_CREATE_CASE };

      const response = await this.client.post<CcdV2Response>(`/case-types/${this.CASE_TYPE}/cases`, {
        data,
        event,
        event_token: token,
      });

      return { id: response.data.id, state: response.data.state, ...response.data.data };
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getEventTrigger(caseId: string, eventName: string): Promise<CcdEventTriggerResponse> {
    try {
      const response = await this.client.get<CcdEventTriggerResponse>(`/cases/${caseId}/event-triggers/${eventName}`);
      return response.data;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async triggerEvent(
    caseId: string,
    data: Partial<Case>,
    eventName: string,
    eventToken: string,
    retries = 0
  ): Promise<CaseWithId> {
    try {
      const event = { id: eventName };
      const response: AxiosResponse<CcdV2Response> = await this.client.post(`/cases/${caseId}/events`, {
        event,
        data,
        event_token: eventToken,
      });

      return { id: response.data.id, state: response.data.state, ...response.data.data };
    } catch (err) {
      const status = err?.response?.status;
      if (retries < this.maxRetries && [502, 504].includes(status)) {
        ++retries;
        logger.info(`retrying send event due to ${status}. this is retry no (${retries})`);
        return this.triggerEvent(caseId, data, eventName, eventToken, retries);
      }
      if (status === 409) {
        logger.error('Case could not be updated due to a version conflict.');
        throw err;
      }
      logger.error(err);
      throw err;
    }
  }
}

export const getCaseApi = (userDetails: UserDetails): CcdApiClient => {
  return new CcdApiClient(
    axios.create({
      baseURL: config.get('ccd.url'),
      headers: {
        Authorization: 'Bearer ' + userDetails.accessToken,
        ServiceAuthorization: getServiceAuthToken(),
        experimental: 'true',
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    })
  );
};

interface CcdV2Response {
  id: string;
  state: string;
  data: CaseData;
}

interface CcdTokenResponse {
  token: string;
}

interface CcdEventTriggerResponse extends CcdTokenResponse {
  case_details?: {
    id: string;
    state: string;
    data: CaseData;
  };
}
