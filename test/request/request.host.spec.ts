import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.host', () => {
    it('should return the Host when present', async () => {
      app.use((request: Request, response: Response) => {
        response.end(request.host)
      })

      await request(app.start())
      .post('/')
      .set('Host', 'example.com')
      .expect('example.com')
    })

    it('should strip port number', async () => {
      app.use((request: Request, response: Response) => {
        response.end(request.host)
      })

      await request(app.start())
      .post('/')
      .set('Host', 'example.com:3000')
      .expect('example.com')
    })

    it('should return empty string otherwise', async () => {
      app.use((request: Request, response: Response) => {
        request.headers.host = undefined     
        response.end(String(request.host))
      })

      await request(app.start())
      .post('/')
      .expect('')
    })

    // it('should work with IPv6 Host', async () => {
    //   app.use((request: Request, response: Response) => {
    //     response.end(request.hostname)
    //   })

    //   await request(app.start())
    //   .post('/')
    //   .set('Host', '[::1]')
    //   .expect('[::1]')
    // })

    // it('should work with IPv6 Host and port', async () => {
    //   app.use((request: Request, response: Response) => {
    //     response.end(request.host)
    //   })

    //   await request(app.start())
    //   .post('/')
    //   .set('Host', '[::1]:3000')
    //   .expect('[::1]')
    // })

    describe('when "trust proxy" is enabled', () => {
      // it('should respect X-Forwarded-Host', async () => {
      //     app.config.get('trust proxy')

      //   app.use((request: Request, response: Response) => {
      //     response.end(request.host)
      //   })

      //   await request(app.start())
      //   .get('/')
      //   .set('Host', 'localhost')
      //   .set('X-Forwarded-Host', 'example.com')
      //   .expect('example.com')
      // })

      // it('should ignore X-Forwarded-Host if socket addr not trusted', async () => {
      //     app.config.set('trust proxy', '10.0.0.1')

      //   app.use((request: Request, response: Response) => {
      //     response.end(request.host)
      //   })

      //   await request(app.start())
      //   .get('/')
      //   .set('Host', 'localhost')
      //   .set('X-Forwarded-Host', 'example.com')
      //   .expect('localhost')
      // })

      it('should default to Host', async () => {
          app.config.set('trust proxy', true)

        app.use((request: Request, response: Response) => {
          response.end(request.host)
        })

        await request(app.start())
        .get('/')
        .set('Host', 'example.com')
        .expect('example.com')
      })

      describe('when trusting hop count', function () {
        it('should respect X-Forwarded-Host', async () => {
              app.config.set('trust proxy', 1)

          app.use((request: Request, response: Response) => {
            response.end(request.host)
          })

          await request(app.start())
          .get('/')
          .set('Host', 'localhost')
          .set('X-Forwarded-Host', 'example.com')
          .expect('example.com')
        })
      })
    })

    describe('when "trust proxy" is disabled', () => {
      it('should ignore X-Forwarded-Host', async () => {
          app.use((request: Request, response: Response) => {
          response.end(request.host)
        })

        await request(app.start())
        .get('/')
        .set('Host', 'localhost')
        .set('X-Forwarded-Host', 'evil')
        .expect('localhost')
      })
    })
  })
})