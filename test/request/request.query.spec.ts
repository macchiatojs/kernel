import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.query', () => {
    it('when missing should return an empty object', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.query)
      })

      await request(app.start())
        .get('/')
        .expect(200, '{}')
    })

    it('when missing should return a parsed query-string', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.query.page)
      })

      await request(app.start())
        .get('/?page=2')
        .expect(200, '2')
    })

    it('should stringify and replace the querystring and search', async () => { 
      app.use((request: Request, response: Response) => {
        request.url?.should.be.ok()
        request.url?.should.be.equal('/store/shoes?page=2&color=blue')
        request.querystring.should.be.ok()
        request.querystring.should.be.equal('page=2&color=blue')
        request.search.should.be.ok()
        request.search.should.be.equal('?page=2&color=blue')
        response.send(200, 'work !')
      })

      await request(app.start())
        .get('/store/shoes')
        .query({ page: 2, color: 'blue' })
        .expect(200, 'work !')
    })

    it('should change .url but not .originalUrl', async () => { 
      app.use((request: Request, response: Response) => {
        request.url?.should.be.ok()
        request.url?.should.be.equal('/store/shoes?page=2')
        request.originalUrl?.should.be.ok()
        request.originalUrl?.should.be.equal('/store/shoes')

        response.send(200, 'work !')
      })

      await request(app.start())
        .get('/store/shoes')
        .query({ page: 2 })
        .expect(200, 'work !')
    })

    it('should .query update the .querystring', async () => { 
      app.use((request: Request, response: Response) => {
        request.query = { page: '2', color: 'blue' }
        response.send(200, request.querystring)
      })

      await request(app.start())
        .get('/')
        .expect(200, 'page=2&color=blue')
    })
  })
})
