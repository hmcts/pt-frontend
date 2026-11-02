import { createToken } from '@services/pcq/createToken';

describe('createToken', () => {
  const params = {
    serviceId: 'PT',
    actor: 'APPLICANT',
    pcqId: crypto.randomUUID(),
    partyId: 'test@email.com',
    returnUrl: '/',
    language: 'en',
    token: '',
  };

  test('Should create token if tokenKey exists', async () => {
    const result = createToken(params, 'PCQ_TOKEN');

    expect(result).toHaveLength(310);
  });
});
