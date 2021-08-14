import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.status(code)', () => {
    it('should set the response .statusCode', async () => {
      app.use((request: Request, response: Response) => {
        response.status = 201
        response.end('Created')
      });

      await request(app.start())
      .get('/')
      .expect('Created')
      .expect(201)
    })
  })
})
