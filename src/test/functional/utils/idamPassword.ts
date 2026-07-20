import { config as testConfig } from '../../config';

export function resolveIdamPassword(): string {
  const encodedPassword = process.env.IDAM_PT_USER_PASSWORD_B64?.trim();
  if (encodedPassword) {
    return Buffer.from(encodedPassword, 'base64').toString('utf8').trim();
  }

  const password = testConfig.IDAM_PT_USER_PASSWORD?.trim();
  if (!password) {
    throw new Error(
      'IDAM test user password is not available. Get it from Azure Key Vault secret ' +
        'pt-idam-test-user-password and export IDAM_PT_USER_PASSWORD (or IDAM_PT_USER_PASSWORD_B64).'
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
