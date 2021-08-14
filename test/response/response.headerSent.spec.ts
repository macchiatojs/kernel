import assert from 'assert'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'


describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.headerSent', () => {
    it('should sent header', async () => {
      app.use(async (request: Request, response: Response) => {
        assert(response.headerSent === false)
        response.redirect('http://google.com')
        assert(response.headerSent === false)

        response.end();
      })

      await request(app.start()).get('/')
    })
  })
})