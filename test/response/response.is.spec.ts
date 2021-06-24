import assert from 'assert'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.is()', () => {
    it('should ignore params', (done) => {
      app.use((request: Request, response: Response, next: any) => {
        response.type = 'text/html; charset=utf-8'
        next()
      });

      app.use((request: Request, response: Response) => {
        response.send(200, response.is('text/*'))
      });

      request(app.start())
      .get('/')
      .expect(200, 'text/html', done);
    })

    it('should return false when no type is set', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, [response.is(), response.is('text'), response.is('text/*')])
      });

      request(app.start())
      .get('/')
      .expect(200, '[false,false,false]', done);
    })

    it('should return the type give no types', (done) => {
      app.use((request: Request, response: Response, next: any) => {
        response.type = 'text/html; charset=utf-8'
        next()
      });

      app.use((request: Request, response: Response) => {
        response.send(200, response.is())
      });

      request(app.start())
      .get('/')
      .expect(200, 'text/html', done);
    })

    it('should return the type or false given one type', (done) => {
      app.use((request: Request, response: Response, next: any) => {
        response.type = 'image/png'
        next()
      });

      app.use((request: Request, response: Response) => {        
        assert(response.is('png') === 'png')
        assert(response.is('.png') === '.png')
        assert(response.is('text/*', 'image/*') === 'image/png')
        assert(response.is('image/*', 'text/*') === 'image/png')
        assert(response.is('image/*', 'image/png') === 'image/png')
        assert(response.is('image/png', 'image/*') === 'image/png')
        assert(response.is(['text/*', 'image/*']) === 'image/png')
        assert(response.is(['image/*', 'text/*']) === 'image/png')
        assert(response.is(['image/*', 'image/png']) === 'image/png')
        assert(response.is(['image/png', 'image/*']) === 'image/png')
    
        assert.strictEqual(response.is('jpeg'), false)
        assert.strictEqual(response.is('.jpeg'), false)
        assert.strictEqual(response.is('text/*', 'application/*'), false)
        assert.strictEqual(response.is('text/html', 'text/plain', 'application/json; charset=utf-8'), false)

        response.end()
      });

      request(app.start())
      .get('/')
      .expect(200, done);
    })

    it('when Content-Type: application/x-www-form-urlencoded should match "urlencoded"', (done) => {
      app.use((request: Request, response: Response, next: any) => {
        response.type = 'application/x-www-form-urlencoded'
        next()
      });

      app.use((request: Request, response: Response) => {
        assert(response.is('urlencoded') === 'urlencoded')
        assert(response.is('json', 'urlencoded') === 'urlencoded')
        assert(response.is('urlencoded', 'json') === 'urlencoded')
        response.end()
      });

      request(app.start())
      .get('/')
      .expect(200, done);
    })
  })
})
