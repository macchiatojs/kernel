
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.search', () => {
    it('should replace the search', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.search);
      });

      request(app.start())
      .get('/store/shoes?page=2&color=blue')
      .expect(200, '?page=2&color=blue', done);
    })

    it('should .search update the .querystring', (done) => {
      app.use((request: Request, response: Response) => {
        request.search = '?page=2&color=blue'
        response.send(200, request.querystring);
      });

      request(app.start())
      .get('/')
      .expect(200, 'page=2&color=blue', done);
    })

    // TESTED IN REQUEST.QUERY AND REQUEST.QUERYSTRING.
  })
})
