import should from 'should'
import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.acceptsEncodings', () => {
    it('should be true if encoding accepted', async () => { 
      app.use((request: Request, response: Response) => {
        request.acceptsEncodings('gzip').should.be.ok()
        request.acceptsEncodings('deflate').should.be.ok()
        response.end()
      })

      await request(app.start())
        .get('/')
        .set('Accept-Encoding', ' gzip, deflate')
        .expect(200)
    })

    it('should be false if encoding not accepted', async () => { 
      app.use((request: Request, response: Response) => {
        request.acceptsEncodings('bogus').should.not.be.ok()
        response.end()
      })

      await request(app.start())
        .get('/')
        .set('Accept-Encoding', ' gzip, deflate')
        .expect(200)
    })
  })
})