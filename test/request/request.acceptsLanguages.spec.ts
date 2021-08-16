import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.acceptsLanguages', () => {
    it('should be true if language accepted', async () => {
      app.use((request: Request, response: Response) => {
        request.acceptsLanguages('en-us').should.be.ok()
        request.acceptsLanguages('en').should.be.ok()
        response.end()
      })

      await request(app.start())
      .get('/')
      .set('Accept-Language', 'en;q=.5, en-us')
      .expect(200)
    })

    it('should be false if language not accepted', async () => {
      app.use((request: Request, response: Response) => {
        request.acceptsLanguages('es').should.not.be.ok()
        response.end()
      })

      await request(app.start())
      .get('/')
      .set('Accept-Language', 'en;q=.5, en-us')
      .expect(200)
    })

    describe('when Accept-Language is not present', () => {
      it('should always return true', async () => {
        app.use((request: Request, response: Response) => {
          request.acceptsLanguages('en').should.be.ok()
          request.acceptsLanguages('es').should.be.ok()
          request.acceptsLanguages('jp').should.be.ok()
          response.end()
        })

        await request(app.start())
        .get('/')
        .expect(200)
      })
    })
  })
})
