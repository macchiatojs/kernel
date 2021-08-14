import assert from 'assert'
import request from 'supertest'
import compose from 'koa-compose'
import Kernel, { Context, WrapKoaCompose } from '../../src'


describe('kernel', () => {
  describe('koa-style middleware', () => {
    describe('.next()', () => {
      it('should behave like koa', (done) => {
        const app = new Kernel({ expressify: false })
        const calls: number[] = []
    
        app
        .use((context: Context, next: any) => {
          calls.push(1)
          return next().then(() => {
            calls.push(6)
          })
        })
        .use((context: Context, next: any) => {
          calls.push(2)
          return next().then(() => {
            calls.push(5)
          })
        })
        .use((context: Context, next: any) => {
          calls.push(3)
          return next().then(() => {
            calls.push(4)
          })
        })

        request(app.start())
          .get('/')
          .expect(() => { assert.deepStrictEqual(calls, [1, 2, 3, 4, 5, 6]) })
          .expect(200, '')
          .end(done)
      })
    })

    describe('compose', () => {
      it('should wrap and compose the middlewares under the hood with koa compose module', (done) => {
        const app = new Kernel({ koaCompose: new WrapKoaCompose(compose) })
        const calls: number[] = []
    
        app
        .use((context: Context, next: any) => {
          calls.push(1)
          return next().then(() => {
            calls.push(6)
          })
        })
        .use((context: Context, next: any) => {
          calls.push(2)
          return next().then(() => {
            calls.push(5)
          })
        })
        .use((context: Context, next: any) => {
          calls.push(3)
          return next().then(() => {
            calls.push(4)
          })
        })

        request(app.start())
          .get('/')
          .expect(() => { assert.deepStrictEqual(calls, [1, 2, 3, 4, 5, 6]) })
          .expect(200, '')
          .end(done)
      })
    })
  })
})
