import assert from 'assert'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('kernel', () => {
  describe('.env', () => {
    it('should be development', (done) => {
      process.env.NODE_ENV = ''
      const app = new Kernel()

      app.use((request: Request, response: Response) => {
        assert(app.dev === true)
        response.send(200, app.env);
      });

      request(app.start())
      .get('/')
      .expect(200, 'development', done);
    })

    it('should be test', (done) => {
      process.env.NODE_ENV = 'test'
      const app = new Kernel()

      app.use((request: Request, response: Response) => {
        assert(app.dev === false)
        response.send(200, app.env);
      });

      request(app.start())
      .get('/')
      .expect(200, 'test', done);
    })
  })
})
