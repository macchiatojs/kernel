import assert from 'assert'
import request from 'supertest'
import WrapKoaCompose from '@macchiatojs/wrap-koa-compose'

import Kernel from '../../src'
import type { Context, Next } from '../../src'

describe('kernel', () => {
  describe('koa-style middleware', () => {
    describe('.next()', () => {
      it('should behave like koa', async () => {
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

        await request(app.start())
          .get('/')
          .expect(() => { assert.deepStrictEqual(calls, [1, 2, 3, 4, 5, 6]) })
          .expect(200, '')
          
      })
    })

    describe('compose', () => {
      it('should wrap and compose the middlewares under the hood with koa compose module', async () => {
        const app = new Kernel({ koaCompose: new WrapKoaCompose<Context, Next>() })
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

        await request(app.start())
          .get('/')
          .expect(() => { assert.deepStrictEqual(calls, [1, 2, 3, 4, 5, 6]) })
          .expect(200, '')
          
      })
    })
  })
})
