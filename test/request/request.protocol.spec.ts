import should from 'should'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.protocol', () => {
    it('should return the protocol string', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.protocol);
      });

      request(app.start())
      .get('/')
      .expect('http', done);
    })

    describe('when "trust proxy" is enabled', () => {
      it('should respect X-Forwarded-Proto', (done) => {

        app.config.set('trust proxy', true);

        app.use((request: Request, response: Response) => {
          response.end(request.protocol);
        });

        request(app.start())
        .get('/')
        .set('X-Forwarded-Proto', 'https')
        .expect('https', done);
      })

      it('should default to the socket addr if X-Forwarded-Proto not present', (done) => {
        app.config.set('trust proxy', true);

        app.use((request: Request, response: Response) => {
          request.socket.encrypted = true;
          response.end(request.protocol);
        });

        request(app.start())
        .get('/')
        .expect('https', done);
      })

      // it('should ignore X-Forwarded-Proto if socket addr not trusted', (done) => {
      //   app.config.set('trust proxy', '10.0.0.1');

      //   app.use((request: Request, response: Response) => {
      //     response.end(request.protocol);
      //   });

      //   request(app.start())
      //   .get('/')
      //   .set('X-Forwarded-Proto', 'https')
      //   .expect('http', done);
      // })

      it('should default to http', (done) => {
        app.config.set('trust proxy', true);

        app.use((request: Request, response: Response) => {
          response.end(request.protocol);
        });

        request(app.start())
        .get('/')
        .expect('http', done);
      })

      describe('when trusting hop count', function () {
        it('should respect X-Forwarded-Proto', (done) => {
          app.config.set('trust proxy', 1);

          app.use((request: Request, response: Response) => {
            response.end(request.protocol);
          });

          request(app.start())
          .get('/')
          .set('X-Forwarded-Proto', 'https')
          .expect('https', done);
        })
      })
    })

    describe('when "trust proxy" is disabled', () => {
      it('should ignore X-Forwarded-Proto', (done) => {
        app.use((request: Request, response: Response) => {
          response.end(request.protocol);
        });

        request(app.start())
        .get('/')
        .set('X-Forwarded-Proto', 'https')
        .expect('http', done);
      })
    })
  })
})