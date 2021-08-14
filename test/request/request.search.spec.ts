
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.search', () => {
    it('should replace the search', async () => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.search)
      })

      await request(app.start())
      .get('/store/shoes?page=2&color=blue')
      .expect(200, '?page=2&color=blue')
    })

    it('should .search update the .querystring', async () => {
      app.use((request: Request, response: Response) => {
        request.search = '?page=2&color=blue'
        response.send(200, request.querystring)
      })

      await request(app.start())
      .get('/')
      .expect(200, 'page=2&color=blue')
    })

    // TESTED IN REQUEST.QUERY AND REQUEST.QUERYSTRING.
  })
})
