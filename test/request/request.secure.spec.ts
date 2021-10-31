import request from 'supertest'

import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.secure', () => {
    describe('when X-Forwarded-Proto is missing', () => {
      it('should return false when http', async () => { 
        app.use((request: Request, response: Response) => {
          response.send(200, request.secure ? 'yes' : 'no')
        })

        await request(app.start())
          .get('/')
          .expect('no')
      })
    })
  })

  describe('.secure', () => {
    describe('when X-Forwarded-Proto is present', () => {
      it('should return false when http', async () => { 
        app.use((request: Request, response: Response) => {
          response.send(200, request.secure ? 'yes' : 'no')
        })

        await request(app.start())
          .get('/')
          .set('X-Forwarded-Proto', 'https')
          .expect('no')
      })

      it('should return true when "trust proxy" is enabled', async () => { 
        app.config.set('trust proxy', true)

        app.use((request: Request, response: Response) => {
          response.send(200, request.secure ? 'yes' : 'no')
        })

        await request(app.start())
          .get('/')
          .set('X-Forwarded-Proto', 'https')
          .expect('yes')
      })

      it('should return false when initial proxy is http', async () => { 
        app.config.set('trust proxy', true)

        app.use((request: Request, response: Response) => {
          response.send(200, request.secure ? 'yes' : 'no')
        })

        await request(app.start())
          .get('/')
          .set('X-Forwarded-Proto', 'http, https')
          .expect('no')
      })

      it('should return true when initial proxy is https', async () => { 
        app.config.set('trust proxy', true)

        app.use((request: Request, response: Response) => {
          response.send(200, request.secure ? 'yes' : 'no')
        })

        await request(app.start())
          .get('/')
          .set('X-Forwarded-Proto', 'https, http')
          .expect('yes')
      })

      describe('when "trust proxy" trusting hop count', () => {
        it('should respect X-Forwarded-Proto', async () => { 
          app.config.set('trust proxy', 1)

          app.use((request: Request, response: Response) => {
            response.send(200, request.secure ? 'yes' : 'no')
          })

          await request(app.start())
            .get('/')
            .set('X-Forwarded-Proto', 'https')
            .expect('yes')
        })
      })
    })
  })
})