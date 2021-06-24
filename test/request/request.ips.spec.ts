import request from 'supertest'
import Kernel, { Request, Response } from '../../src'


describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.ips', () => {
    describe('when X-Forwarded-For is present', () => {
      describe('when "trust proxy" is enabled', () => {
        it('should return an array of the specified addresses', (done) => {
          app.config.set('trust proxy', true);

          app.use((request: Request, response: Response) => {
            response.send(200, request.ips);
          });

          request(app.start())
          .get('/')
          .set('X-Forwarded-For', 'client,p1,p2')
          .expect('["client","p1","p2"]', done);
        })
      })

      describe('when "trust proxy" is disabled', () => {
        it('should return an empty array', (done) => {
          app.config.set('trust proxy', false);

          app.use((request: Request, response: Response) => {
            response.send(200, request.ips);
          });

          request(app.start())
          .get('/')
          .set('X-Forwarded-For', 'client,p1,p2')
          .expect('[]', done);
        })
      })
    })

    describe('when X-Forwarded-For is not present', () => {
      it('should return []', (done) => {
        app.use((request: Request, response: Response) => {
          response.send(200, request.ips)
        })

        request(app.start())
        .get('/')
        .expect('[]', done)
      })
    })
  })
})
