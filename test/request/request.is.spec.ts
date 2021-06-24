import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request.is()', function () {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('when given a mime type', function () {
    it('should return the type when matching', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('application/json'))
      })

      request(app.start())
      .post('/')
      .type('application/json')
      .send('{}')
      .expect(200, 'application/json', done)
    })

    it('should return false when not matching', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('image/jpeg'))
      })

      request(app.start())
      .post('/')
      .type('application/json')
      .send('{}')
      .expect(200, 'false', done)
    })

    it('should ignore charset', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('application/json'))
      })

      request(app.start())
      .post('/')
      .type('application/json; charset=UTF-8')
      .send('{}')
      .expect(200, 'application/json', done)
    })
  })

  describe('when content-type is not present', () => {
    it('should return false', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('application/json'))
      })

      request(app.start())
      .post('/')
      .send('{}')
      .expect(200, 'false', done)
    })
  })

  describe('when given an extension', () => {
    it('should lookup the mime type', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('json'))
      })

      request(app.start())
      .post('/')
      .type('application/json')
      .send('{}')
      .expect(200, 'json', done)
    })
  })

  describe('when given */subtype', () => {
    it('should return the full type when matching', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('*/json'))
      })

      request(app.start())
      .post('/')
      .type('application/json')
      .send('{}')
      .expect(200, 'application/json', done)
    })

    it('should return false when not matching', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('*/html'))
      })

      request(app.start())
      .post('/')
      .type('application/json')
      .send('{}')
      .expect(200, 'false', done)
    })

    it('should ignore charset', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('*/json'))
      })

      request(app.start())
      .post('/')
      .type('application/json; charset=UTF-8')
      .send('{}')
      .expect(200, 'application/json', done)
    })
  })

  describe('when given type/*', () => {
    it('should return the full type when matching', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('application/*'))
      })

      request(app.start())
      .post('/')
      .type('application/json')
      .send('{}')
      .expect(200, 'application/json', done)
    })

    it('should return false when not matching', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('text/*'))
      })

      request(app.start())
      .post('/')
      .type('application/json')
      .send('{}')
      .expect(200, 'false', done)
    })

    it('should ignore charset', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('application/*'))
      })

      request(app.start())
      .post('/')
      .type('application/json; charset=UTF-8')
      .send('{}')
      .expect(200, 'application/json', done)
    })
  })
})