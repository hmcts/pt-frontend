import axios from 'axios';

const testUrl = process.env.TEST_URL || 'http://localhost:4000';

describe('Smoke Test', () => {
  test('GET /health returns 200 with UP', async () => {
    const response = await axios.get(`${testUrl}/health`);

    expect(response.status).toBe(200);
    expect(response.data.status).toBe('UP');
  });

  test('GET /info returns 200', async () => {
    const response = await axios.get(`${testUrl}/info`);

    expect(response.status).toBe(200);
  });

  test('public pre-application start page returns 200 and contains the service name', async () => {
    const response = await axios.get(`${testUrl}/pre-application/starting-or-returning`);

    expect(response.status).toBe(200);
    expect(response.data).toContain('Apply for an open market rent determination');
  });

  test('GET /login returns a 302 to IDAM /o/authorize', async () => {
    const response = await axios.get(`${testUrl}/login`, {
      maxRedirects: 0,
      validateStatus: () => true,
    });

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('/o/authorize');
  });
});
