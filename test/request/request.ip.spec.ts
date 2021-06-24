import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.ip', () => {
    describe('when X-Forwarded-For is present', () => {
      describe('when "trust proxy" is enabled', () => {
        it('should return the client addr', (done) => {
          app.config.set('trust proxy', true);

          app.use((request: Request, response: Response) => {
            response.end(request.ip);
          });

          request(app.start())
          .get('/')
          .set('X-Forwarded-For', 'client, p1, p2')
          .expect('client', done);
        })
      })

      describe('when "trust proxy" is disabled', () => {
        it('should return the remote address', (done) => {
          app.use((request: Request, response: Response) => {
            response.end(request.ip);
          });

          let server
          const test = request(server = app.start()).get('/')
          test.set('X-Forwarded-For', 'client, p1, p2')
          test.expect(200, getExpectedClientAddress(server), done);
        })
      })
    })

    describe('when X-Forwarded-For is not present', () => {
      it('should return the remote address', (done) => {
        app.config.set('trust proxy', true);

        app.use((request: Request, response: Response) => {
          response.end(request.ip);
        });
        let server
        const test = request(server= app.start()).get('/')
        test.expect(200, getExpectedClientAddress(server), done)
      })
    })
  })
})

/**
 * Get the local client address depending on AF_NET of server
 */

function getExpectedClientAddress(server) {
  return server.address().address === '::'
    ? '::ffff:127.0.0.1'
    : '127.0.0.1';
}
