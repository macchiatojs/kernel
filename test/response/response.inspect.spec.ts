import assert from 'assert'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.inspect()', () => {
    it('should return a json representation', (done) => {
      app.use((request: Request, response: Response) => {
        const inspect = response.inspect()

        assert(inspect.status === 200)
        assert(inspect.message === undefined)
        assert(JSON.stringify(inspect.headers) === '{}')
        assert(inspect.body === undefined)
        
        response.send(200, inspect);
      });

      request(app.start())
      .get('/')
      .expect(200, '{"status":200,"headers":{}}', done);
    })
  })
})