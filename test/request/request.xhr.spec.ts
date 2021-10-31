import request from 'supertest'

import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.xhr', () => {
    it('should return true when X-Requested-With is xmlhttprequest', async () => { 
      app.use((request: Request, response: Response) => {
        request.xhr.should.be.true()
        response.end()
      })

      await request(app.start())
        .get('/')
        .set('X-Requested-With', 'xmlhttprequest')
        .expect(200)
    })

    it('should case-insensitive', async () => { 
      app.use((request: Request, response: Response) => {
        request.xhr.should.be.true()
        response.end()
      })

      await request(app.start())
        .get('/')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect(200)
    })

    it('should return false otherwise', async () => { 
      app.use((request: Request, response: Response) => {
        request.xhr.should.be.false()
        response.end()
      })

      await request(app.start())
        .get('/')
        .set('X-Requested-With', 'blahblah')
        .expect(200)
    })

    it('should return false when not present', async () => { 
      app.use((request: Request, response: Response) => {
        request.xhr.should.be.false()
        response.end()
      })

      await request(app.start())
        .get('/')
        .expect(200)
    })
  })
})
