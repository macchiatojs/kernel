import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.subdomains', () => {
    describe('when present', () => {
      it('should return an array', async () => { 
        app.use((request: Request, response: Response) => {
          response.send(200, request.subdomains)
        })

        await request(app.start())
          .get('/')
          .set('Host', 'tobi.ferrets.example.com')
          .expect(200, ['ferrets', 'tobi'])
      })

      it('should work with IPv4 address', async () => { 
        app.use((request: Request, response: Response) => {
          response.send(200, request.subdomains)
        })

        await request(app.start())
          .get('/')
          .set('Host', '127.0.0.1')
          .expect(200, [])
      })

      it('should work with IPv6 address', async () => { 
        app.use((request: Request, response: Response) => {
          response.send(200, request.subdomains)
        })

        await request(app.start())
          .get('/')
          .set('Host', '[::1]')
          .expect(200, [])
      })
    })

    describe('otherwise', () => {
      it('should return an empty array', async () => { 
        app.use((request: Request, response: Response) => {
          response.send(200, request.subdomains)
        })

        await request(app.start())
          .get('/')
          .set('Host', 'example.com')
          .expect(200, [])
      })
    })

    describe('with no host', () => {
      it('should return an empty array', async () => { 
        app.use((request: Request, response: Response) => {
          request.headers.host = undefined
          response.send(200, request.subdomains)
        })

        await request(app.start())
          .get('/')
          .expect(200, [])
      })
    })

    describe('with trusted X-Forwarded-Host', () => {
      it('should return an array', async () => { 
        app.config.set('trust proxy', true)

        app.use((request: Request, response: Response) => {
          response.send(200, request.subdomains)
        })

        await request(app.start())
          .get('/')
          .set('X-Forwarded-Host', 'tobi.ferrets.example.com')
          .expect(200, ['ferrets', 'tobi'])
      })
    })

    describe('when subdomain offset is set', () => {
      describe('when subdomain offset is zero', () => {
        it('should return an array with the whole domain', async () => { 
          app.config.set('subdomain offset', 0)

          app.use((request: Request, response: Response) => {
            response.send(200, request.subdomains)
          })

          await request(app.start())
            .get('/')
            .set('Host', 'tobi.ferrets.sub.example.com')
            .expect(200, ['com', 'example', 'sub', 'ferrets', 'tobi'])
        })

        it('should return an array with the whole IPv4', async () => { 
          app.config.set('subdomain offset', 0)

          app.use((request: Request, response: Response) => {
            response.send(200, request.subdomains)
          })

          await request(app.start())
            .get('/')
            .set('Host', '127.0.0.1')
            .expect(200, ['127.0.0.1'])
        })

        // TODO: fix IPv6
        // it('should return an array with the whole IPv6', async () => { 
        //   app.config.set('subdomain offset', 0)

        //   app.use((request: Request, response: Response) => {
        //     response.send(200, request.subdomains)
        //   })

        //   await request(app.start())
        //   .get('/')
        //   .set('Host', '[::1]')
        //   .expect(200, ['[::1]'])
        // })
      })

      describe('when present', () => {
        it('should return an array', async () => { 
          app.config.set('subdomain offset', 3)

          app.use((request: Request, response: Response) => {
            response.send(200, request.subdomains)
          })

          await request(app.start())
            .get('/')
            .set('Host', 'tobi.ferrets.sub.example.com')
            .expect(200, ['ferrets', 'tobi'])
        })
      })

      describe('otherwise', () => {
        it('should return an empty array', async () => { 
          app.config.set('subdomain offset', 3)

          app.use((request: Request, response: Response) => {
            response.send(200, request.subdomains)
          })

          await request(app.start())
            .get('/')
            .set('Host', 'sub.example.com')
            .expect(200, [])
        })
      })
    })
  })
})