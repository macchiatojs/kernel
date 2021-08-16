import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.get(field)', () => {
    it('should get the response header field', async () => {
      app.use((request: Request, response: Response) => {
        response.set('Content-Type', 'text/x-foo')
        response.send(200, response.get('Content-Type'))
      })

      await request(app.start())
      .get('/')
      .expect(200, 'text/x-foo')
    })
  })
})