
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.length', () => {
    it('should return length in content-length', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.length);
      });

      request(app.start())
      .post('/')
      .set('content-length', '10')
      .expect('10', done);
    })

    it('with no content-length present', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.length);
      });

      request(app.start())
      .post('/')
      .expect('0', done);
    })
  })
})
