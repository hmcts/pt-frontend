import { config as testConfig } from '../../config';

const PLACEHOLDER_PASSWORD = 'NEED TO INSERT SECRET';

export function resolveIdamPassword(): string {
  const encodedPassword = process.env.IDAM_PT_USER_PASSWORD_B64?.trim();
  if (encodedPassword) {
    return Buffer.from(encodedPassword, 'base64').toString('utf8').trim();
  }

  const password = testConfig.IDAM_PT_USER_PASSWORD?.trim();
  if (!password || password === PLACEHOLDER_PASSWORD) {
    throw new Error(
      'idam.testUser.password is not set. Export IDAM_PT_USER_PASSWORD from Azure Key Vault ' +
        'secret pt-idam-test-user-password (or set IDAM_PT_USER_PASSWORD_B64) before running login tests.'
    );
  }

  return password;
}

export function resolveIdamEmail(): string {
  const email = testConfig.IDAM_PT_USER_EMAIL?.trim();
  if (!email) {
    throw new Error('idam.testUser.email is not set in config/default.json (or IDAM_PT_USER_EMAIL).');
  }

  return email;
}
