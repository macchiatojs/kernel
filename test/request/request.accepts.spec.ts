import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.accepts(type)', () => {
    it('should return true when Accept is not present', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.accepts('json') ? 'yes' : 'no')
      })

      request(app.start())
        .get('/')
        .expect('yes', done)
    })

    it('should return true when present', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.accepts('json') ? 'yes' : 'no')
      })

      request(app.start())
        .get('/')
        .set('Accept', 'application/json')
        .expect('yes', done)
    })

    it('should return false otherwise', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.accepts('json') ? 'yes' : 'no')
      })

      request(app.start())
        .get('/')
        .set('Accept', 'text/html')
        .expect('no', done)
    })
  })

  it('should accept an argument list of type names', (done) => {
    app.use((request: Request, response: Response) => {
      response.end(request.accepts('json', 'html'))
    })

    request(app.start())
      .get('/')
      .set('Accept', 'application/json')
      .expect('json', done)
  })

  describe('.accepts(types)', () => {
    it('should return the first when Accept is not present', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.accepts(['json', 'html']))
      })

      request(app.start())
        .get('/')
        .expect('json', done)
    })

    it('should return the first acceptable type', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.accepts(['json', 'html']))
      })

      request(app.start())
        .get('/')
        .set('Accept', 'text/html')
        .expect('html', done)
    })

    it('should return false when no match is made', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.accepts(['text/html', 'application/json']) ? 'yup' : 'nope')
      })

      request(app.start())
        .get('/')
        .set('Accept', 'foo/bar, bar/baz')
        .expect('nope', done)
    })

    it('should take quality into account', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.accepts(['text/html', 'application/json']))
      })

      request(app.start())
        .get('/')
        .set('Accept', '*/html q=.5, application/json')
        .expect('application/json', done)
    })

    it('should return the first acceptable type with canonical mime types', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.accepts(['application/json', 'text/html']))
      })

      request(app.start())
        .get('/')
        .set('Accept', '*/html')
        .expect('text/html', done)
    })
  })
})
