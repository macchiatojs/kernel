import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.type', () => {
    it('should return type void of parameters', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.type);
      });

      request(app.start())
      .get('/')
      .set('content-type', 'text/html; charset=utf-8')
      .expect(200, 'text/html',done)
    })

    it('should with no host present', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.type);
      });

      request(app.start())
      .get('/')
      .expect(200, '', done)
    })
  })
})
