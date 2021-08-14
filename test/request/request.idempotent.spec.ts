
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.idempotent', () => {
    it('when the request method is idempotent', async () => {
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

      await request(app.start())
      .get('/')
      .expect('Welcome !')
    })

    it('when the request method is idempotent', async () => {
      app.use((request: Request, response: Response) => {
        request.method = 'POST'
        request.idempotent.should.be.False

        response.end('Welcome !');
      });

      await request(app.start())
      .get('/')
      .expect('Welcome !')
    })
  })
})
