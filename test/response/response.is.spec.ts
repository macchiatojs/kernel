import assert from 'assert'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.is()', () => {
    it('should ignore params', async () => {
      app.use((request: Request, response: Response, next: any) => {
        response.type = 'text/html; charset=utf-8'
        next()
      })

      app.use((request: Request, response: Response) => {
        response.send(200, response.is('text/*'))
      })

      await request(app.start())
      .get('/')
      .expect(200, 'text/html')
    })

    it('should return false when no type is set', async () => {
      app.use((request: Request, response: Response) => {
        response.send(200, [response.is(), response.is('text'), response.is('text/*')])
      })

      await request(app.start())
      .get('/')
      .expect(200, '[false,false,false]')
    })

    it('should return the type give no types', async () => {
      app.use((request: Request, response: Response, next: any) => {
        response.type = 'text/html; charset=utf-8'
        next()
      })

      app.use((request: Request, response: Response) => {
        response.send(200, response.is())
      })

      await request(app.start())
      .get('/')
      .expect(200, 'text/html')
    })

    it('should return the type or false given one type', async () => {
      app.use((request: Request, response: Response, next: any) => {
        response.type = 'image/png'
        next()
      })

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
      })

      await request(app.start())
      .get('/')
      .expect(200)
    })

    it('when Content-Type: application/x-www-form-urlencoded should match "urlencoded"', async () => {
      app.use((request: Request, response: Response, next: any) => {
        response.type = 'application/x-www-form-urlencoded'
        next()
      })

      app.use((request: Request, response: Response) => {
        assert(response.is('urlencoded') === 'urlencoded')
        assert(response.is('json', 'urlencoded') === 'urlencoded')
        assert(response.is('urlencoded', 'json') === 'urlencoded')
        response.end()
      })

      await request(app.start())
      .get('/')
      .expect(200)
    })
  })
})
