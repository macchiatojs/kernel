import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.etag', () => {
    it('should not modify an etag with quotes', (done) => {
      app.use((request: Request, response: Response) => {
        response.etag = '"asdf"'
        response.send(200, response.etag)
      });

      request(app.start())
      .get('/')
      .expect('"asdf"', done);
    })

    it('should not modify a weak etag', (done) => {
      app.use((request: Request, response: Response) => {
        response.etag = 'W/"asdf"'
        
        response.send(200, response.etag)
      });

      request(app.start())
      .get('/')
      .expect('W/"asdf"', done);
    })

    it('should add quotes around an etag if necessary', (done) => {
      app.use((request: Request, response: Response) => {
        response.etag = 'asdf'
        response.send(200, response.etag)
      });

      request(app.start())
      .get('/')
      .expect('"asdf"', done);
    })
  })
})
