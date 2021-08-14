
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.querystring', () => {
    it('should return the querystring', async () => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.querystring);
      });

      await request(app.start())
      .get('/store/shoes?page=2&color=blue')
      .expect(200, 'page=2&color=blue')
    })

    it('should update request.search and request.query', async () => {
      app.use((request: Request, response: Response) => {
        request.url?.should.be.ok()
        request.url?.should.be.equal('/store/shoes?page=2&color=blue')
        request.search.should.be.ok()
        request.search.should.be.equal('?page=2&color=blue')
        request.query.page?.should.be.equal('2')
        request.query.color?.should.be.equal('blue')

        response.send(200, 'work !');
      });

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

        response.send(200, 'work !');
      });

      await request(app.start())
      .get('/store/shoes')
      .query({ page: 2 })
      .expect(200, 'work !')
    })
  })
})
