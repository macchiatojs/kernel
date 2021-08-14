import Cookies from 'cookies'
import assert from 'assert'
import request from 'supertest'
import Kernel, { Request } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.cookies', () => {
    it('should exist cookies inside the request', async () => {
      app.use((request: Request) => {
        assert(request.cookies instanceof Cookies)
      });

      await await request(app.start()).get('/')
    })
  })
})
