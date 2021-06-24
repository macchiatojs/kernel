import request from 'supertest'
import Kernel, { Request, Response } from '../../src'


describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.secure', () => {
    describe('when X-Forwarded-Proto is missing', () => {
      it('should return false when http', (done) => {
        app.use((request: Request, response: Response) => {
          response.send(200, request.secure ? 'yes' : 'no');
        });

        request(app.start())
        .get('/')
        .expect('no', done)
      })
    })
  })

  describe('.secure', () => {
    describe('when X-Forwarded-Proto is present', () => {
      it('should return false when http', (done) => {
        app.use((request: Request, response: Response) => {
          response.send(200, request.secure ? 'yes' : 'no');
        });

        request(app.start())
        .get('/')
        .set('X-Forwarded-Proto', 'https')
        .expect('no', done)
      })

      it('should return true when "trust proxy" is enabled', (done) => {
        app.config.set('trust proxy', true);

        app.use((request: Request, response: Response) => {
          response.send(200, request.secure ? 'yes' : 'no');
        });

        request(app.start())
        .get('/')
        .set('X-Forwarded-Proto', 'https')
        .expect('yes', done)
      })

      it('should return false when initial proxy is http', (done) => {
        app.config.set('trust proxy', true);

        app.use((request: Request, response: Response) => {
          response.send(200, request.secure ? 'yes' : 'no');
        });

        request(app.start())
        .get('/')
        .set('X-Forwarded-Proto', 'http, https')
        .expect('no', done)
      })

      it('should return true when initial proxy is https', (done) => {
        app.config.set('trust proxy', true);

        app.use((request: Request, response: Response) => {
          response.send(200, request.secure ? 'yes' : 'no');
        });

        request(app.start())
        .get('/')
        .set('X-Forwarded-Proto', 'https, http')
        .expect('yes', done)
      })

      describe('when "trust proxy" trusting hop count', function () {
        it('should respect X-Forwarded-Proto', (done) => {
          app.config.set('trust proxy', 1);

          app.use((request: Request, response: Response) => {
            response.send(200, request.secure ? 'yes' : 'no');
          });

          request(app.start())
          .get('/')
          .set('X-Forwarded-Proto', 'https')
          .expect('yes', done)
        })
      })
    })
  })
})