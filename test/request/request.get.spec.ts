import request from 'supertest'
import assert from 'assert'

import Kernel, { Request, Response } from '../../src'

// TODO: work why header is undefined.
describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.get(field)', () => {
    it('should return the header field value', async () => { 
      app.use((request: Request, response: Response) => {
        assert(request.get('Something-Else') === '')
        response.end(request.get('Content-Type'))
      })

      await request(app.start())
        .post('/')
        .set('Content-Type', 'application/json')
        .expect('application/json')
    })

    it('should special-case Referer', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.get('Referer'))
      })

      await request(app.start())
        .post('/')
        .set('Referrer', 'http://foobar.com')
        .expect('http://foobar.com')
    })
  })
})