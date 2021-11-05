// import { PassThrough } from 'stream'
import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.flush', () => {
    it('should set headersSent', async () => { 
      app.use((request: Request, response: Response) => {
        response.flush()
        response.flush() // Should be idempotent.
        response.send(200, response.headerSent)
      })

      await request(app.start())
        .get('/')
        .expect('true')
    })

    it('should allow a response afterwards', async () => { 
      app.use((request: Request, response: Response) => {
        response.set('foo', 'bar')
        response.flush()
        response.send(200, response.get('foo'))
      })

      await request(app.start())
        .get('/')
        .expect('bar')
    })

    it('should send the correct status code', async () => { 
      app.use((request: Request, response: Response) => {
        // sould put the status 1st before the flush method.
        response.status = 401
        response.set('foo', 'bar')
        response.flush()
        response.send(401, [response.status, response.get('foo')])
      })

      await request(app.start())
        .get('/')
        .expect(401, '[401,"bar"]')
    })

    it('should fail to set the headers after flushHeaders', async () => { 
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
      })

      await request(app.start())
        .get('/')
        .expect(401, 'response.set fail response.status fail response.length fail')
    })

    // // TODO: see this.
    // it('should flush headers first and delay to send data', async () => { 
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
    //   })

    //   await request(app.start())
    //   .get('/')
    //   .expect(200, '{"message":"hello!"}')
    // }).timeout(6000)
  })
})
