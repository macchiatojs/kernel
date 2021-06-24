
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.idempotent', () => {
    it('when the request method is idempotent', (done) => {
      app.use((request: Request, response: Response) => {

        [
          'GET',
          'HEAD',
          'PUT',
          'DELETE',
          'OPTIONS',
          'TRACE'
        ].forEach((method) => {
          request.method = method
          request.idempotent.should.be.True
        })

        response.end('Welcome !');
      });

      request(app.start())
      .get('/')
      .expect('Welcome !', done);
    })

    it('when the request method is idempotent', (done) => {
      app.use((request: Request, response: Response) => {
        request.method = 'POST'
        request.idempotent.should.be.False

        response.end('Welcome !');
      });

      request(app.start())
      .get('/')
      .expect('Welcome !', done);
    })
  })
})
