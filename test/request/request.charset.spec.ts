import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.charset', () => {
    it('with no content-type present', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.charset)
      })

      await request(app.start())
        .get('/')
        .expect(200, '')
    })

    it('with charset present', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.charset)
      })

      await request(app.start())
        .get('/')
        .set('Content-Type', 'text/plain')
        .expect(200, '')
    })

    it('with a charset', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.charset)
      })

      await request(app.start())
        .get('/')
        .set('Content-Type', 'text/plain; charset=utf-8')
        .expect(200, 'utf-8')
    })

    it('should return "" if content-type is invalid', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.charset)
      })

      await request(app.start())
        .get('/')
        .set('Content-Type', 'application/json; application/text; charset=utf-8')
        .expect(200, '')
    })
  })
})
