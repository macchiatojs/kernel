import request from 'supertest'

import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.acceptsCharsets(type)', () => {
    describe('when Accept-Charset is not present', () => {
      it('should return true', async () => { 
        app.use((request: Request, response: Response) => {
          response.end(request.acceptsCharsets('utf-8') ? 'yes' : 'no')
        })

        await request(app.start())
          .get('/')
          .expect('yes')
      })
    })

    describe('when Accept-Charset is present', () => {
      it('should return true', async () => { 
        app.use((request: Request, response: Response) => {
          response.end(request.acceptsCharsets('utf-8') ? 'yes' : 'no')
        })

        await request(app.start())
          .get('/')
          .set('Accept-Charset', 'foo, bar, utf-8')
          .expect('yes')
      })

      it('should return false otherwise', async () => { 
        app.use((request: Request, response: Response) => {
          response.end(request.acceptsCharsets('utf-8') ? 'yes' : 'no')
        })

        await request(app.start())
          .get('/')
          .set('Accept-Charset', 'foo, bar')
          .expect('no')
      })
    })
  })
})