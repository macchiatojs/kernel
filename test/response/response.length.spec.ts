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

  describe('.length', () => {
    it('should return a number when Content-Length is defined', (done) => {
      app.use((request: Request, response: Response, next: any) => {
        response.set('Content-Length', '10')
        response.send(200, response.length)
        assert(response.length === 10)
      });

      request(app.start())
        .post('/')
        .expect(200, done())
    })

    it('should return a 0 when Content-Length is not defined', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, response.length)
      });

      request(app.start())
        .get('/')
        .expect(200, '0', done)
    })

    it('should return a number when Content-Length is not defined and a .body is set to string', (done) => {
        app.use((request: Request, response: Response) => {
          response.body = 'Hello !'
          assert(response.length === 7)
        });
  
        request(app.start())
          .get('/')
          .expect(200, 'Hello !', done)
    })

    it('should return a number when Content-Length is not defined and a .body is set to buffer', (done) => {
      app.use((request: Request, response: Response) => {
        response.body = Buffer.from('foo bar')
        assert(response.length === 7)
      });

      request(app.start())
        .get('/')
        .expect(200, undefined, done)
    })

    it('should return a number when Content-Length is not defined and a .body is set to JSON object', (done) => {
      app.use((request: Request, response: Response) => {
        response.body = { hello: 'world' }
        assert(response.length === 17)
      });

      request(app.start())
        .get('/')
        .expect(200, '{"hello":"world"}', done)
    })

    it('should not return a number when Content-Length is not defined and a .body is set to stream', (done) => {
      app.use((request: Request, response: Response) => {
        response.body = fs.createReadStream(path.join(__dirname, '../../package.json'))
        assert(response.length === undefined)
      });

      request(app.start())
        .get('/')
        .expect(200, undefined, done)
    })

    it('should return a 0 when Content-Length is not defined and a .body is set to null', (done) => {
      app.use((request: Request, response: Response) => {
        response.body = null
        assert(response.length === 0)
      });

      request(app.start())
        .get('/')
        .expect(204, '', done)
    })

    it('should return a 0 when Content-Length is not defined and a .body is not', (done) => {
      app.use((request: Request, response: Response) => {
        assert(response.length === 0)
      });

      request(app.start())
        .get('/')
        .expect(200, '', done)
    })
  })
})
