import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.path', () => {
    it('should return the origin of url', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.path)
      })

      await request(app.start())
        .get('/login?redirect=/post/1/comments')
        .expect('/login')
    })

    it('should return the origin of url', async () => { 
      app.use((request: Request, response: Response) => {
        request.path = '/kiko'
        response.send(200, request.path)
      })

      await request(app.start())
        .get('/login')
        .expect('/kiko')
    })
  })
})
