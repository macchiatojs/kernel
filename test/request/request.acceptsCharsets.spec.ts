import request from 'supertest'
import Kernel, { Request, Response } from '../../src'


describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.acceptsCharsets(type)', () => {
    describe('when Accept-Charset is not present', () => {
      it('should return true', (done) => {
        app.use((request: Request, response: Response) => {
          response.end(request.acceptsCharsets('utf-8') ? 'yes' : 'no')
        })

        request(app.start())
          .get('/')
          .expect('yes', done)
      })
    })

    describe('when Accept-Charset is present', function () {
      it('should return true', (done) => {
        app.use((request: Request, response: Response) => {
          response.end(request.acceptsCharsets('utf-8') ? 'yes' : 'no')
        })

        request(app.start())
          .get('/')
          .set('Accept-Charset', 'foo, bar, utf-8')
          .expect('yes', done)
      })

      it('should return false otherwise', (done) => {
        app.use((request: Request, response: Response) => {
          response.end(request.acceptsCharsets('utf-8') ? 'yes' : 'no')
        })

        request(app.start())
          .get('/')
          .set('Accept-Charset', 'foo, bar')
          .expect('no', done)
      })
    })
  })
})