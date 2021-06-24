import should from 'should'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', function () {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  // note about these tests: "Link" and "X-*" are chosen because
  // the common node.js versions white list which _incoming_
  // headers can appear multiple times; there is no such white list
  // for outgoing, though
  describe('.append(field, val)', function () {
    it('should append multiple headers', (done) => {
      app.use((request: Request, response: Response, next: any) => {
        response.append('Link', '<http://localhost/>')
        next()
      })

      app.use((request: Request, response: Response) => {
        response.append('Link', '<http://localhost:80/>')
        response.end()
      })

      request(app.start())
      .get('/')
      .expect('Link', '<http://localhost/>, <http://localhost:80/>', done)
    })

    it('should accept array of values', (done) => {
      app.use((request: Request, response: Response, next: any) => {
        response.append('Set-Cookie', ['foo=bar', 'fizz=buzz'])
        response.end()
      })

      request(app.start())
      .get('/')
      .expect(function (response) {
        should(response.headers['set-cookie']).eql(['foo=bar', 'fizz=buzz'])
      })
      .expect(200, done)
    })

    it('should get reset by response.set(field, val)', (done) => {
      app.use((request: Request, response: Response, next: any) => {
        response.append('Link', '<http://localhost/>')
        response.append('Link', '<http://localhost:80/>')
        next()
      })

      app.use((request: Request, response: Response) => {
        response.set('Link', '<http://127.0.0.1/>')
        response.end()
      });

      request(app.start())
      .get('/')
      .expect('Link', '<http://127.0.0.1/>', done)
    })

    it('should work with response.set(field, val) first', (done) => {
      app.use((request: Request, response: Response, next: any) => {
        response.set('Link', '<http://localhost/>')
        next()
      })

      app.use((request: Request, response: Response) => {
        response.append('Link', '<http://localhost:80/>')
        response.end()
      })

      request(app.start())
      .get('/')
      .expect('Link', '<http://localhost/>, <http://localhost:80/>', done)
    })

    // TODO: work to support cookies.
    // it('should work with cookies', (done) => {
    //   app.use((request: Request, response: Response, next: any) => {
    //     response.cookie('foo', 'bar')
    //     next()
    //   })

    //   app.use((request: Request, response: Response) => {
    //     response.append('Set-Cookie', 'bar=baz')
    //     response.end()
    //   })

    //   request(app.start())
    //   .get('/')
    //   .expect(function (res) {
    //     should(response.headers['set-cookie']).eql(['foo=bar; Path=/', 'bar=baz'])
    //   })
    //   .expect(200, done)
    // })
  })
})
