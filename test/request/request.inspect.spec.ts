
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.inspect', () => {
    it('should return the inspect object', (done) => {
      app.use((request: Request, response: Response) => {
        request.inspect().should.be.ok()
        request.inspect().should.be.containDeep({
          method: 'GET',
          url: '/',
          headers: {
            'accept-encoding': 'gzip, deflate',
            connection: 'close'
          }
        })

        response.end('Welcome !');
      });

      request(app.start())
      .get('/')
      .expect('Welcome !', done);
    })
  })
})
