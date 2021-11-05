import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.etag', () => {
    it('should not modify an etag with quotes', async () => { 
      app.use((request: Request, response: Response) => {
        response.etag = '"asdf"'
        response.send(200, response.etag)
      })

      await request(app.start())
      .get('/')
      .expect('"asdf"')
    })

    it('should not modify a weak etag', async () => { 
      app.use((request: Request, response: Response) => {
        response.etag = 'W/"asdf"'
        
        response.send(200, response.etag)
      })

      await request(app.start())
        .get('/')
        .expect('W/"asdf"')
    })

    it('should add quotes around an etag if necessary', async () => { 
      app.use((request: Request, response: Response) => {
        response.etag = 'asdf'
        response.send(200, response.etag)
      })

      await request(app.start())
        .get('/')
        .expect('"asdf"')
    })
  })
})
