import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.protocol', () => {
    it('should return the protocol string', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.protocol)
      })

      await request(app.start())
        .get('/')
        .expect('http')
    })

    describe('when "trust proxy" is enabled', () => {
      it('should respect X-Forwarded-Proto', async () => { 
        app.config.set('trust proxy', true)

        app.use((request: Request, response: Response) => {
          response.end(request.protocol)
        })

        await request(app.start())
          .get('/')
          .set('X-Forwarded-Proto', 'https')
          .expect('https')
      })

      it('should default to the socket addr if X-Forwarded-Proto not present', async () => { 
        app.config.set('trust proxy', true)

        app.use((request: Request, response: Response) => {
          request.socket.encrypted = true
          response.end(request.protocol)
        })

        await request(app.start())
          .get('/')
          .expect('https')
      })

      // // TODO: should add white-list and black-list with some fn...
      // it('should ignore X-Forwarded-Proto if socket addr not trusted', async () => { 
      //   app.config.set('trust proxy', '10.0.0.1')

      //   app.use((request: Request, response: Response) => {
      //     response.end(request.protocol)
      //   })

      //   await request(app.start())
      //   .get('/')
      //   .set('X-Forwarded-Proto', 'https')
      //   .expect('http')
      // })

      it('should default to http', async () => { 
        app.config.set('trust proxy', true)

        app.use((request: Request, response: Response) => {
          response.end(request.protocol)
        })

        await request(app.start())
          .get('/')
          .expect('http')
      })

      describe('when trusting hop count', () => {
        it('should respect X-Forwarded-Proto', async () => { 
          app.config.set('trust proxy', 1)

          app.use((request: Request, response: Response) => {
            response.end(request.protocol)
          })

          await request(app.start())
            .get('/')
            .set('X-Forwarded-Proto', 'https')
            .expect('https')
        })
      })
    })

    describe('when "trust proxy" is disabled', () => {
      it('should ignore X-Forwarded-Proto', async () => { 
        app.use((request: Request, response: Response) => {
          response.end(request.protocol)
        })

        await request(app.start())
          .get('/')
          .set('X-Forwarded-Proto', 'https')
          .expect('http')
      })
    })
  })
})
