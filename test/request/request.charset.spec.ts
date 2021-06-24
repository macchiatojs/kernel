import should from 'should'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.charset', () => {
    it('with no content-type present', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.charset);
      });

      request(app.start())
      .get('/')
      .expect(200, '', done);
    })

    it('with charset present', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.charset);
      });

      request(app.start())
      .get('/')
      .set('Content-Type', 'text/plain')
      .expect(200, '',done);
    })

    it('with a charset', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.charset);
      });

      request(app.start())
      .get('/')
      .set('Content-Type', 'text/plain; charset=utf-8')
      .expect(200, 'utf-8', done);
    })

    it('should return "" if content-type is invalid', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.charset);
      });

      request(app.start())
      .get('/')
      .set('Content-Type', 'application/json; application/text; charset=utf-8')
      .expect(200, '', done);
    })
  })
})
