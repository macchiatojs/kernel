import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.set(field, value)', () => {
    it('should set a field value', async () => { 
      app.use((request: Request, response: Response) => {
        response.set('x-foo', 'bar')
        response.send(200, response.get('x-foo'))
      })

      await request(app.start())
        .get('/')
        .expect(200, 'bar')
    })

    it('should set a field value of array', async () => { 
      app.use((request: Request, response: Response) => {
        response.set('x-foo', ['foo', 'bar'])
        response.send(200, response.get('x-foo'))
      })

      await request(app.start())
        .get('/')
        .expect(200, '["foo","bar"]')
    })

    it('should set multiple fields', async () => { 
      app.use((request: Request, response: Response) => {
        response.set({ foo: '1', bar: '2' })
        response.send(200, [response.get('foo'), response.get('bar')])
      })

      await request(app.start())
        .get('/')
        .expect(200, '["1","2"]')
    })
  })
})
