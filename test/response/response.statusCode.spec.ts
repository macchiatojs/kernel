import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.statusCode(code)', () => {
    it('should set the response .statusCode', async () => { 
      app.use((request: Request, response: Response) => {
        response.statusCode(201).end('Created')
      })

      await request(app.start())
        .get('/')
        .expect('Created')
        .expect(201)
    })
  })
})
