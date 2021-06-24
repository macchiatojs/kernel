import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.hostname', () => {
    it('should return the Host when present', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.hostname);
      });

      request(app.start())
      .post('/')
      .set('Host', 'example.com')
      .expect('example.com', done);
    })

    it('should strip port number', (done) => {
      app.use((request: Request, response: Response) => {
        response.end(request.hostname);
      });

      request(app.start())
      .post('/')
      .set('Host', 'example.com:3000')
      .expect('example.com', done);
    })

    it('should return empty string otherwise', (done) => {
      app.use((request: Request, response: Response) => {
        request.headers.host = undefined;
        response.end(String(request.hostname));
      });

      request(app.start())
      .post('/')
      .expect('', done);
    })

    // it('should work with IPv6 Host', (done) => {
    //   app.use((request: Request, response: Response) => {
    //     response.end(request.hostname);
    //   });

    //   request(app.start())
    //   .post('/')
    //   .set('Host', '[::1]')
    //   .expect('[::1]', done);
    // })

    // it('should work with IPv6 Host and port', (done) => {
    //   app.use((request: Request, response: Response) => {
    //     response.end(request.hostname);
    //   });

    //   request(app.start())
    //   .post('/')
    //   .set('Host', '[::1]:3000')
    //   .expect('[::1]', done);
    // })

    describe('when "trust proxy" is enabled', () => {
      it('should respect X-Forwarded-Host', (done) => {
        app.config.set('trust proxy', true);

        app.use((request: Request, response: Response) => {
          response.end(request.hostname);
        });

        request(app.start())
        .get('/')
        .set('Host', 'localhost')
        .set('X-Forwarded-Host', 'example.com:3000')
        .expect('example.com', done);
      })

      // it('should ignore X-Forwarded-Host if socket addr not trusted', (done) => {
      //   app.config.set('trust proxy', '10.0.0.1');

      //   app.use((request: Request, response: Response) => {
      //     response.end(request.hostname);
      //   });

      //   request(app.start())
      //   .get('/')
      //   .set('Host', 'localhost')
      //   .set('X-Forwarded-Host', 'example.com')
      //   .expect('localhost', done);
      // })

      it('should default to Host', (done) => {
        app.config.set('trust proxy', true);

        app.use((request: Request, response: Response) => {
          response.end(request.hostname);
        });

        request(app.start())
        .get('/')
        .set('Host', 'example.com')
        .expect('example.com', done);
      })

      describe('when multiple X-Forwarded-Host', function () {
        it('should use the first value', (done) => {
          app.config.set('trust proxy', true)

          app.use((request: Request, response: Response) => {
            response.end(request.hostname)
          })

          request(app.start())
          .get('/')
          .set('Host', 'localhost')
          .set('X-Forwarded-Host', 'example.com, foobar.com')
          .expect(200, 'example.com', done)
        })

        it('should remove OWS around comma', (done) => {
          app.config.set('trust proxy', true)

          app.use((request: Request, response: Response) => {
            response.end(request.hostname)
          })

          request(app.start())
          .get('/')
          .set('Host', 'localhost')
          .set('X-Forwarded-Host', 'example.com , foobar.com')
          .expect(200, 'example.com', done)
        })

        it('should strip port number', (done) => {
          app.config.set('trust proxy', true)

          app.use((request: Request, response: Response) => {
            response.end(request.hostname)
          })

          request(app.start())
          .get('/')
          .set('Host', 'localhost')
          .set('X-Forwarded-Host', 'example.com:8080 , foobar.com:8888')
          .expect(200, 'example.com', done)
        })
      })
    })

    describe('when "trust proxy" is disabled', () => {
      it('should ignore X-Forwarded-Host', (done) => {

        app.use((request: Request, response: Response) => {
          response.end(request.hostname);
        });

        request(app.start())
        .get('/')
        .set('Host', 'localhost')
        .set('X-Forwarded-Host', 'evil')
        .expect('localhost', done);
      })
    })
  })
})