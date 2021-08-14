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
      })

      request(app.start())
        .post('/')
        .expect(200, done())
    })

    it('should return a 0 when Content-Length is not defined', async () => {
      app.use((request: Request, response: Response) => {
        response.send(200, response.length)
      })

      await request(app.start())
        .get('/')
        .expect(200, '0')
    })

    it('should return a number when Content-Length is not defined and a .body is set to string', async () => {
        app.use((request: Request, response: Response) => {
          response.body = 'Hello !'
          assert(response.length === 7)
        })
  
        await request(app.start())
          .get('/')
          .expect(200, 'Hello !')
    })

    it('should return a number when Content-Length is not defined and a .body is set to buffer', async () => {
      app.use((request: Request, response: Response) => {
        response.body = Buffer.from('foo bar')
        assert(response.length === 7)
      })

      await request(app.start())
        .get('/')
        .expect(200, undefined)
    })

    it('should return a number when Content-Length is not defined and a .body is set to JSON object', async () => {
      app.use((request: Request, response: Response) => {
        response.body = { hello: 'world' }
        assert(response.length === 17)
      })

      await request(app.start())
        .get('/')
        .expect(200, '{"hello":"world"}')
    })

    it('should not return a number when Content-Length is not defined and a .body is set to stream', async () => {
      app.use((request: Request, response: Response) => {
        response.body = fs.createReadStream(path.join(__dirname, '../../package.json'))
        assert(response.length === undefined)
      })

      await request(app.start())
        .get('/')
        .expect(200, undefined)
    })

    it('should return a 0 when Content-Length is not defined and a .body is set to null', async () => {
      app.use((request: Request, response: Response) => {
        response.body = null
        assert(response.length === 0)
      })

      await request(app.start())
        .get('/')
        .expect(204, '')
    })

    it('should return a 0 when Content-Length is not defined and a .body is not', async () => {
      app.use((request: Request, response: Response) => {
        assert(response.length === 0)
      })

      await request(app.start())
        .get('/')
        .expect(200, '')
    })
  })
})
