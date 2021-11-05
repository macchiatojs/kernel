import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.length', () => {
    it('should return length in content-length', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.length)
      })

      await request(app.start())
        .post('/')
        .set('content-length', '10')
        .expect('10')
    })

    it('with no content-length present', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.length)
      })

      await request(app.start())
        .post('/')
        .expect('0')
    })
  })
})
