import assert from 'assert'
import request from 'supertest'
import Kernel, { Request, Response, Next } from '../../src'


describe('kernel', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('middleware', () => {
    describe('.next()', () => {
      it('should behave like connect', async () => { 
        const calls: string[] = []

        app.use((request: Request, response: Response, next: Next) => {
          calls.push('one')
          next()
        })

        app.use((request: Request, response: Response, next: Next) => {
          calls.push('two')
          next()
        })

        app.use((request: Request, response: Response) => {
            let buffer = ''
            response.set('Content-Type', 'application/json; charset=utf-8;')
            request.raw
              .on('data', (chunk) => { buffer += chunk })
              .on('end', () => { response.body = buffer })
        })

        await request(app.start())
        .get('/')
        .set('Content-Type', 'application/json')
        .send('{"foo":"bar"}')
        .expect('Content-Type', 'application/json; charset=utf-8;')
        .expect(() => { assert.deepStrictEqual(calls, ['one', 'two']) })
        .expect(200, '')
        
      })
    })
  })
})
