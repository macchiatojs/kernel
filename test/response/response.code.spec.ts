import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.code(code)', () => {
    it('should set the response .code', async () => { 
      app.use((request: Request, response: Response) => {
        response.code(201).end('Created')
      })

      await request(app.start())
        .get('/')
        .expect('Created')
        .expect(201)
    })
  })
})
