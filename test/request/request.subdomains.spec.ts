import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.subdomains', () => {
    describe('when present', () => {
      it('should return an array', (done) => {
        app.use((request: Request, response: Response) => {
          response.send(200, request.subdomains);
        });

        request(app.start())
        .get('/')
        .set('Host', 'tobi.ferrets.example.com')
        .expect(200, ['ferrets', 'tobi'], done);
      })

      it('should work with IPv4 address', (done) => {

        app.use((request: Request, response: Response) => {
          response.send(200, request.subdomains);
        });

        request(app.start())
        .get('/')
        .set('Host', '127.0.0.1')
        .expect(200, [], done);
      })

      it('should work with IPv6 address', (done) => {

        app.use((request: Request, response: Response) => {
          response.send(200, request.subdomains);
        });

        request(app.start())
        .get('/')
        .set('Host', '[::1]')
        .expect(200, [], done);
      })
    })

    describe('otherwise', () => {
      it('should return an empty array', (done) => {

        app.use((request: Request, response: Response) => {
          response.send(200, request.subdomains);
        });

        request(app.start())
        .get('/')
        .set('Host', 'example.com')
        .expect(200, [], done);
      })
    })

    describe('with no host', () => {
      it('should return an empty array', (done) => {

        app.use((request: Request, response: Response) => {
          request.headers.host = undefined;
          response.send(200, request.subdomains);
        });

        request(app.start())
        .get('/')
        .expect(200, [], done);
      })
    })

    describe('with trusted X-Forwarded-Host', function () {
      it('should return an array', (done) => {
        app.config.set('trust proxy', true);

        app.use((request: Request, response: Response) => {
          response.send(200, request.subdomains);
        });

        request(app.start())
        .get('/')
        .set('X-Forwarded-Host', 'tobi.ferrets.example.com')
        .expect(200, ['ferrets', 'tobi'], done);
      })
    })

    describe('when subdomain offset is set', () => {
      describe('when subdomain offset is zero', () => {
        it('should return an array with the whole domain', (done) => {
          app.config.set('subdomain offset', 0);

          app.use((request: Request, response: Response) => {
            response.send(200, request.subdomains);
          });

          request(app.start())
          .get('/')
          .set('Host', 'tobi.ferrets.sub.example.com')
          .expect(200, ['com', 'example', 'sub', 'ferrets', 'tobi'], done);
        })

        it('should return an array with the whole IPv4', (done) => {
          app.config.set('subdomain offset', 0);

          app.use((request: Request, response: Response) => {
            response.send(200, request.subdomains);
          });

          request(app.start())
          .get('/')
          .set('Host', '127.0.0.1')
          .expect(200, ['127.0.0.1'], done);
        })

        // TODO: fix IPv6
        // it('should return an array with the whole IPv6', (done) => {
        //   app.config.set('subdomain offset', 0);

        //   app.use((request: Request, response: Response) => {
        //     response.send(200, request.subdomains);
        //   });

        //   request(app.start())
        //   .get('/')
        //   .set('Host', '[::1]')
        //   .expect(200, ['[::1]'], done);
        // })
      })

      describe('when present', () => {
        it('should return an array', (done) => {
          app.config.set('subdomain offset', 3);

          app.use((request: Request, response: Response) => {
            response.send(200, request.subdomains);
          });

          request(app.start())
          .get('/')
          .set('Host', 'tobi.ferrets.sub.example.com')
          .expect(200, ['ferrets', 'tobi'], done);
        })
      })

      describe('otherwise', () => {
        it('should return an empty array', (done) => {
          app.config.set('subdomain offset', 3);

          app.use((request: Request, response: Response) => {
            response.send(200, request.subdomains);
          });

          request(app.start())
          .get('/')
          .set('Host', 'sub.example.com')
          .expect(200, [], done);
        })
      })
    })
  })
})