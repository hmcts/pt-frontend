import { expect } from 'chai';
import request from 'supertest';

import { app } from '../../main/app';

// TODO: replace this sample test with proper route tests for your application
/* eslint-disable jest/expect-expect */
describe('Home page', () => {
  describe('on GET', () => {
    test('should return sample home page', async () => {
      await request(app)
        .get('/')
        .expect(res => expect(res.status).to.equal(200));
    });

    test('should render English service name by default', async () => {
      await request(app)
        .get('/')
        .expect(res => {
          expect(res.status).to.equal(200);
          expect(res.text).to.include('Property Tribunal');
          expect(res.text).to.include('Cymraeg');
        });
    });

    test('should render Welsh service name when lang=cy', async () => {
      await request(app)
        .get('/?lang=cy')
        .expect(res => {
          expect(res.status).to.equal(200);
          expect(res.text).to.include('cyProperty Tribunal');
          expect(res.text).to.include('English');
        });
    });
  });
});
