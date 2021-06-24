import request from 'supertest'
import Kernel, { Request, Response } from '../../src'


describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.has(field)', () => {
    it('should has a field', (done) => {
      app.use((request: Request, response: Response) => {
        response.set('Content-Type', 'text/x-foo');
        response.send(200, response.has('Content-Type'));
      });

      request(app.start())
      .get('/')
      .expect(200, 'true', done);
    })

    it('should has not field', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, response.has('Content-Type'));
      });

      request(app.start())
      .get('/')
      .expect(200, 'false', done);
    })
  })
})