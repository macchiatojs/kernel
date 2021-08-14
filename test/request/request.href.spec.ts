import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.href', () => {
    it('should work with `GET http://127.0.0.1/user', async () => {
      app.use((request: Request, response: Response) => {
        response.end(request.href);
      });

      await request(app.start())
      .get('/user')
      .expect('http://127.0.0.1/user')
    })
  })
})
