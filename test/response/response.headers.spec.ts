import request from 'supertest'
import Kernel, { Request, Response } from '../../src'


describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.headers', () => {
    it('should return the response header object', (done) => {
      app.use((request: Request, response: Response, next: any) => {
        response.set('X-Token', 'secret123#crypted')
        response.set('Content-Type', 'application/json')

        next();
      });

      app.use((request: Request, response: Response) => {
        response.send(200, response.headers);
      });

      request(app.start())
      .get('/')
      .expect(200, '{"x-token":"secret123#crypted","content-type":"application/json"}', done);
    })

    it('should return empty object', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, response.headers);
      });

      request(app.start())
      .get('/')
      .expect(200, '{}', done);
    })
  })
})