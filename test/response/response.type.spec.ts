import request from 'supertest'
import Kernel, { Request, Response } from '../../src'
import { shouldNotHaveHeader } from './response.redirect.spec'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.type(str)', () => {
    it('should set the Content-Type based on a filename', (done) => {
      app.use((request: Request, response: Response) => {
        response.type = 'foo.js'
        response.end('var name = "tj";')
      });

      request(app.start())
      .get('/')
      .expect('Content-Type', 'application/javascript; charset=utf-8')
      .end(done)
    })

    it('should default to empty', (done) => {
      app.use((request: Request, response: Response) => {
        response.type = 'rawr'
        response.end('var name = "tj";');
      });

      request(app.start())
      .get('/')
      .expect(shouldNotHaveHeader('Content-Type')) 
      .end(done);
    })

    it('should set the Content-Type with type/subtype', (done) => {
      app.use((request: Request, response: Response) => {
        response.type = 'application/vnd.amazon.ebook'
        response.end('var name = "tj";');
      });

      request(app.start())
      .get('/')
      .expect('Content-Type', 'application/vnd.amazon.ebook', done);
    })
  })
})