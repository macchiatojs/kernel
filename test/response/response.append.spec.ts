import should from 'should'
import request from 'supertest'

import Kernel, { Request, Response, Next } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  // note about these tests: "Link" and "X-*" are chosen because
  // the common node.js versions white list which _incoming_
  // headers can appear multiple times; there is no such white list
  // for outgoing, though
  describe('.append(field, val)', () => {
    it('should append multiple headers', async () => { 
      app.use((request: Request, response: Response, next: Next) => {
        response.append('Link', '<http://localhost/>')
        next()
      })

      app.use((request: Request, response: Response) => {
        response.append('Link', '<http://localhost:80/>')
        response.end()
      })

      await request(app.start())
      .get('/')
      .expect('Link', '<http://localhost/>, <http://localhost:80/>')
    })

    it('should accept array of values', async () => { 
      app.use((request: Request, response: Response, next: Next) => {
        response.append('Set-Cookie', ['foo=bar', 'fizz=buzz'])
        response.end()
      })

      await request(app.start())
      .get('/')
      .expect(function (response) {
        should(response.headers['set-cookie']).eql(['foo=bar', 'fizz=buzz'])
      })
      .expect(200)
    })

    it('should get reset by response.set(field, val)', async () => { 
      app.use((request: Request, response: Response, next: Next) => {
        response.append('Link', '<http://localhost/>')
        response.append('Link', '<http://localhost:80/>')
        next()
      })

      app.use((request: Request, response: Response) => {
        response.set('Link', '<http://127.0.0.1/>')
        response.end()
      })

      await request(app.start())
      .get('/')
      .expect('Link', '<http://127.0.0.1/>')
    })

    it('should work with response.set(field, val) first', async () => { 
      app.use((request: Request, response: Response, next: Next) => {
        response.set('Link', '<http://localhost/>')
        next()
      })

      app.use((request: Request, response: Response) => {
        response.append('Link', '<http://localhost:80/>')
        response.end()
      })

      await request(app.start())
      .get('/')
      .expect('Link', '<http://localhost/>, <http://localhost:80/>')
    })

    // TODO: work to support cookies.
    // it('should work with cookies', async () => { 
    //   app.use((request: Request, response: Response, next: Next) => {
    //     response.cookie('foo', 'bar')
    //     next()
    //   })

    //   app.use((request: Request, response: Response) => {
    //     response.append('Set-Cookie', 'bar=baz')
    //     response.end()
    //   })

    //   await request(app.start())
    //   .get('/')
    //   .expect(function (res) {
    //     should(response.headers['set-cookie']).eql(['foo=bar; Path=/', 'bar=baz'])
    //   })
    //   .expect(200)
    // })
  })
})
