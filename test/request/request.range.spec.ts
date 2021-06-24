import RangeParser from 'range-parser'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.range(size)', () => {
    it('should return parsed ranges', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.range(120))
      })

      request(app.start())
      .get('/')
      .set('Range', 'bytes=0-50,51-100')
      .expect(200, '[{"start":0,"end":50},{"start":51,"end":100}]', done)
    })

    it('should cap to the given size', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.range(75))
      })

      request(app.start())
      .get('/')
      .set('Range', 'bytes=0-100')
      .expect(200, '[{"start":0,"end":74}]', done)
    })

    it('should cap to the given size when open-ended', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.range(75))
      })

      request(app.start())
      .get('/')
      .set('Range', 'bytes=0-')
      .expect(200, '[{"start":0,"end":74}]', done)
    })

    // it('should have a .type', (done) => {
    //   app.use((request: Request, response: Response) => {
    //     response.send(200, request.range(120)[0]?.type!)
    //   })

    //   request(app.start())
    //   .get('/')
    //   .set('Range', 'bytes=0-100')
    //   .expect(200, '"bytes"', done)
    // })

    it('should accept any type', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, (request.range(120) as any).type)
      })

      request(app.start())
      .get('/')
      .set('Range', 'users=0-2')
      .expect(200, 'users', done)
    })

    it('should return undefined if no range', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, String(request.range(120)))
      })

      request(app.start())
      .get('/')
      .expect(200, 'undefined', done)
    })
  })

  describe('.range(size, options)', () => {
    describe('with "combine: true" option', () => {
      it('should return combined ranges', (done) => {
          app.use((request: Request, response: Response) => {
          response.send(200, request.range(120, {
            combine: true
          }))
        })

        request(app.start())
        .get('/')
        .set('Range', 'bytes=0-50,51-100')
        .expect(200, '[{"start":0,"end":100}]', done)
      })
    })
  })
})
