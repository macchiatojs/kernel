import request from 'supertest'

import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.stale', () => {
    it('should return false when the resource is not modified', async () => { 
      const etag = '"12345"'

      app.use((request: Request, response: Response) => {
        response.set('ETag', etag)
        // TODO: look more here when don't pass 304 status.
        response.send(304, request.stale)
      })

      await request(app.start())
        .get('/')
        .set('If-None-Match', etag)
        .expect(304)
    })

    it('should return true when the resource is modified', async () => { 
      app.use((request: Request, response: Response) => {
        response.set('ETag', '"123"')
        response.send(200, request.stale)
      })

      await request(app.start())
        .get('/')
        .set('If-None-Match', '"12345"')
        .expect(200, 'true')
    })

    it('should return true without response headers', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.stale)
      })

      await request(app.start())
        .get('/')
        .expect(200, 'true')
    })
  })
})
