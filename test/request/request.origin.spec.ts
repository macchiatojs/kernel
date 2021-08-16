import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.origin', () => {
    it('should return the origin of url', async () => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.origin)
      })

      await request(app.start())
      .get('/')
      .expect('http://127.0.0.1')
    })
  })
})
