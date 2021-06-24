import request from 'supertest'
import Kernel, { Request, Response } from '../../src'
import { shouldNotHaveHeader } from './response.redirect.spec'

describe('response.vary()', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  // with no arguments --> handled by TS.

  describe('with an empty array', () => {
    it('should not set Vary', (done) => {
      app.use((request: Request, response: Response) => {
        response.vary([]);
        response.end();
      });

      request(app.start())
      .get('/')
      .expect(shouldNotHaveHeader('Vary'))
      .expect(200, done);
    })
  })

  describe('with an array', () => {
    it('should set the values', (done) => {
      app.use((request: Request, response: Response) => {
        response.vary(['Accept', 'Accept-Language', 'Accept-Encoding']);
        response.end();
      });

      request(app.start())
      .get('/')
      .expect('Vary', 'Accept, Accept-Language, Accept-Encoding')
      .expect(200, done);
    })
  })

  describe('with a string', () => {
    it('should set the value', (done) => {
      app.use((request: Request, response: Response) => {
        response.vary('Accept');
        response.end();
      });

      request(app.start())
      .get('/')
      .expect('Vary', 'Accept')
      .expect(200, done);
    })
  })

  describe('when the value is present', () => {
    it('should not add it again', (done) => {
      app.use((request: Request, response: Response) => {
        response.vary('Accept');
        response.vary('Accept-Encoding');
        response.vary('Accept-Encoding');
        response.vary('Accept-Encoding');
        response.vary('Accept');
        response.end();
      });

      request(app.start())
      .get('/')
      .expect('Vary', 'Accept, Accept-Encoding')
      .expect(200, done);
    })
  })
})