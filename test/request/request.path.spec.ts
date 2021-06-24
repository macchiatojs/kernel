// -------------fama ahja fi path
import path from 'path/posix'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.path', () => {
    it('should return the origin of url', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.path);
      });

      request(app.start())
      .get('/login?redirect=/post/1/comments')
      .expect('/login', done);
    })

    it('should return the origin of url', (done) => {
      app.use((request: Request, response: Response) => {
        request.path = '/kiko'
        response.send(200, request.path);
      });

      request(app.start())
      .get('/login')
      .expect('/kiko', done);
    })
  })
})
