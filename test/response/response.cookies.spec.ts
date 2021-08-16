import assert from 'assert'
import request from 'supertest'
import Cookies from 'cookies'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.cookies', () => {
    it('should exist cookies inside the request', async () => {
      app.use((request: Request, response: Response) => {
        assert(response.cookies instanceof Cookies)
      })

      await await request(app.start()).get('/')
    })
  })
})
