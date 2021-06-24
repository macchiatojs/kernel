import { PassThrough } from 'stream'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.flush', () => {
    it('should set headersSent', (done) => {
      app.use((request: Request, response: Response) => {
        response.flush()
        response.flush() // Should be idempotent.
        response.send(200, response.headerSent)
      });

      request(app.start())
        .get('/')
        .expect('true', done);
    })

    it('should allow a response afterwards', (done) => {
      app.use((request: Request, response: Response) => {
        response.set('foo', 'bar')
        response.flush()
        response.send(200, response.get('foo'))
      });

      request(app.start())
        .get('/')
        .expect('bar', done);
    })

    it('should send the correct status code', (done) => {
      app.use((request: Request, response: Response) => {
        // sould put the status 1st before the flush method.
        response.status = 401
        response.set('foo', 'bar')
        response.flush()
        response.send(401, [response.status, response.get('foo')])
      });

      request(app.start())
        .get('/')
        .expect(401, '[401,"bar"]', done)
    })

    it('should fail to set the headers after flushHeaders', (done) => {
      app.use((request: Request, response: Response) => {
        // sould put the status 1st before the flush method.
        response.status = 401
        response.set('foo', 'bar')
        response.flush()
        let body = ''
        try {
          response.set('X-Shouldnt-Work', 'Value')
        } catch (err) {
          body += 'response.set fail '
        }
        try {
          response.status = 200
        } catch (err) {
          body += 'response.status fail '
        }
        try {
          response.length = 10
        } catch (err) {
          body += 'response.length fail'
        }

        response.body = body
      });

      request(app.start())
        .get('/')
        .expect(401, 'response.set fail response.status fail response.length fail', done)
    })

    // it('should flush headers first and delay to send data', (done) => {
    //   app.use((request: Request, response: Response) => {
    //     response.type = 'json'
    //     response.status = 200
    //     request.headers.link = '</css/mycss.css>; as=style; rel=preload, <https://img.craftflair.com>; rel=preconnect; crossorigin'
    //     const stream = new PassThrough()
    //     response.body = stream
    //     response.flush()
    //     setTimeout(() => {
    //       stream.end(JSON.stringify({ message: 'hello!' }))
    //     }, 5000)
    //   });

    //   request(app.start())
    //   .get('/')
    //   .expect(200, '{"message":"hello!"}', done)
    // }).timeout(6000)
  })
})