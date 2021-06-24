import should from 'should'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.acceptsLanguages', () => {
    it('should be true if language accepted', (done) => {
      app.use((request: Request, response: Response) => {
        request.acceptsLanguages('en-us').should.be.ok()
        request.acceptsLanguages('en').should.be.ok()
        response.end();
      });

      request(app.start())
      .get('/')
      .set('Accept-Language', 'en;q=.5, en-us')
      .expect(200, done);
    })

    it('should be false if language not accepted', (done) => {
      app.use((request: Request, response: Response) => {
        request.acceptsLanguages('es').should.not.be.ok()
        response.end();
      });

      request(app.start())
      .get('/')
      .set('Accept-Language', 'en;q=.5, en-us')
      .expect(200, done);
    })

    describe('when Accept-Language is not present', () => {
      it('should always return true', (done) => {
        app.use((request: Request, response: Response) => {
          request.acceptsLanguages('en').should.be.ok()
          request.acceptsLanguages('es').should.be.ok()
          request.acceptsLanguages('jp').should.be.ok()
          response.end();
        });

        request(app.start())
        .get('/')
        .expect(200, done);
      })
    })
  })
})
