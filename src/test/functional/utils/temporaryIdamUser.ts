import { randomInt } from 'node:crypto';
import { threadId } from 'node:worker_threads';

import { resolveIdamEmail, resolveIdamPassword } from './idamPassword';

const CLIENT_ID = 'pt-frontend';
const KNOWN_ENVIRONMENTS = new Set(['aat', 'demo', 'perftest', 'ithc']);

export type CreatedCitizen = {
  email: string;
};

type CreateCitizenInput = {
  permanentEmail: string;
  password: string;
  clientSecret: string;
};

/**
 * Create a temporary IDAM citizen for automated tests and leaves the permanent
 * account for manual testing. Those accounts expire after about two hours.
 * Each Codecept worker calls this once, so parallel browsers do not share a login.
 */
export async function useTemporaryCitizen(): Promise<void> {
  if (process.env.IDAM_PT_USE_PERMANENT_USER === 'true') {
    process.stderr.write(`Using permanent IDAM citizen ${resolveIdamEmail()}\n`);
    return;
  }

  const clientSecret = process.env.PT_FRONTEND_IDAM_SECRET?.trim();
  if (!clientSecret) {
    process.stderr.write('PT_FRONTEND_IDAM_SECRET is not set; using the permanent IDAM citizen\n');
    return;
  }

  const created = await createTemporaryCitizen({
    permanentEmail: resolveIdamEmail(),
    password: resolveIdamPassword(),
    clientSecret,
  });
  process.env.IDAM_PT_USER_EMAIL = created.email;
  process.stderr.write(`Using temporary IDAM citizen ${created.email}\n`);
}

export async function createTemporaryCitizen(input: CreateCitizenInput): Promise<CreatedCitizen> {
  const { tokenBase, testingSupport } = idamServiceUrls();
  const accessToken = await passwordGrantToken(tokenBase, input);
  const email = temporaryEmail();

  const response = await fetch(`${testingSupport}/test/idam/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password: input.password,
      user: {
        email,
        forename: 'pt',
        surname: 'citizen',
        roleNames: ['citizen'],
      },
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (response.status !== 201) {
    throw new Error(
      `IDAM testing support did not create a citizen (${response.status}): ${await responseText(response)}`
    );
  }

  const body = (await response.json()) as { id?: string };
  if (!body.id) {
    throw new Error('IDAM testing support create-user response was missing an id.');
  }

  return { email };
}

export function idamServiceUrls(): { tokenBase: string; testingSupport: string } {
  const configured = (process.env.ENVIRONMENT || 'aat').trim().toLowerCase();
  const environment = KNOWN_ENVIRONMENTS.has(configured) ? configured : 'aat';

  return {
    tokenBase: stripTrailingSlash(
      process.env.IDAM_TOKEN_BASE_URL || `https://idam-api.${environment}.platform.hmcts.net`
    ),
    testingSupport: stripTrailingSlash(
      process.env.IDAM_TESTING_SUPPORT_URL || `https://idam-testing-support-api.${environment}.platform.hmcts.net`
    ),
  };
}

function temporaryEmail(): string {
  return `TEST_PT_USER.citizen.${threadId}.${randomInt(1000000, 10000000)}@test.test`;
}

async function passwordGrantToken(tokenBase: string, input: CreateCitizenInput): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: CLIENT_ID,
    client_secret: input.clientSecret,
    username: input.permanentEmail,
    password: input.password,
    scope: 'openid profile roles',
  });

  const response = await fetch(`${tokenBase}/o/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`IDAM token request failed (${response.status}): ${await responseText(response)}`);
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    throw new Error('IDAM token response was missing an access token.');
  }

  return payload.access_token;
}

async function responseText(response: Response): Promise<string> {
  return (await response.text()).slice(0, 500);
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}
