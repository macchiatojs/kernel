import fs from 'fs'
import path from 'path'
import assert from 'assert'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.body', () => {
    it('should not override when Content-Type is set', (done) => {
      app.use((request: Request, response: Response) => {
        assert(response.body === undefined)
        response.type = 'png'
        response.body = Buffer.from('something')
      })

      request(app.start())
        .get('/')
        .expect('content-type', 'image/png')
        .expect(200, done)
    })

    it('should override as json when body is an object', (done) => {
      app.use((request: Request, response: Response, next: any) => {
        assert.strictEqual(response.body, undefined)
        response.type = 'html'
        response.body = '<em>hey</em>'

        assert.strictEqual(
          'text/html; charset=utf-8',
          response.headers['content-type']
        )

        assert.strictEqual(response.body, '<em>hey</em>')

        return next()
      })

      app.use((request: Request, response: Response) => {
        response.body = { foo: 'bar' }
      })

      request(app.start())
        .get('/')
        .expect('Content-Type', 'application/json')
        .expect(200, '{"foo":"bar"}', done)
    })

    it('should override length when body is an object', (done) => {
      app.use((request: Request, response: Response) => {
        assert.strictEqual(response.body, undefined)
        response.type = 'html'
        response.body = 'something'

        assert.strictEqual(response.length, 9)
      })

      request(app.start())
        .get('/')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200, 'something', done)
    })

    it('should default to undefined when a string is given', (done) => {
      app.use((request: Request, response: Response) => {
        assert.strictEqual(response.body, undefined)
        response.body = 'Imed'
        assert.strictEqual(response.headers['content-type'], undefined)
      })

      request(app.start())
        .get('/')
        .expect(200, 'Imed', done)
    })

    it('should set length when a string is given', (done) => {
      app.use((request: Request, response: Response) => {
        response.body = 'Imed'
      })

      request(app.start())
        .get('/')
        .set('Content-Length', '4')
        .expect(200, 'Imed', done)
    })

    it('should set length when an html is given', (done) => {
      const string = '<h1>Tobi</h1>'

      app.use((request: Request, response: Response) => {
        response.body = string
      })

      request(app.start())
        .get('/')
        .set('Content-Length', String(string.length))
        .expect(200, string, done)
    })

    // it('should get html when an xml is given', (done) => {
    //   app.use((request: Request, response: Response) => {
    //     // response.type = 'html'
    //     response.body = '<?xml version="1.0" encoding="UTF-8"?><x-tag>1</x-tag>'

    //     console.log(response.body);

    //   })

    //   request(app.start())
    //     .get('/')
    //     .set('Content-Length', 'text/html; charset=utf-8')
    //     .expect(400, '', done)
    // })

    // it('when a stream is given should default to an octet stream', (done) => {
    //   app.use((request: Request, response: Response) => {
    //     response.body = fs.createReadStream(path.join(__dirname, '../../LICENSE'))
    //   })

    //   request(app.start())
    //     .get('/')
    //     .set('Content-Length', 'application/octet-stream')
    //     .expect(200, done)
    // })

    it('should default to an octet stream when a buffer is given', (done) => {
      app.use((request: Request, response: Response) => {
        response.body = Buffer.from('hey')
      })

      request(app.start())
        .get('/')
        .expect('Content-Type', 'application/octet-stream')
        .expect(200, done)
    })

    it('should set length when a buffer is given', (done) => {
      app.use((request: Request, response: Response) => {
        response.body = Buffer.from('Imed')
      })

      request(app.start())
        .get('/')
        .expect('Content-Type', 'application/octet-stream')
        .expect('Content-Length', '4')
        .expect(200, done)
    })

    it('should default to json when an object is given', (done) => {
      app.use((request: Request, response: Response) => {
        response.body = { foo: 'bar' }
      })

      request(app.start())
        .get('/')
        .expect('Content-Type', 'application/json')
        .expect(200, done)
    })
  })
})
