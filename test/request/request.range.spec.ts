import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.range(size)', () => {
    it('should return parsed ranges', async () => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.range(120))
      })

      await request(app.start())
      .get('/')
      .set('Range', 'bytes=0-50,51-100')
      .expect(200, '[{"start":0,"end":50},{"start":51,"end":100}]')
    })

    it('should cap to the given size', async () => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.range(75))
      })

      await request(app.start())
      .get('/')
      .set('Range', 'bytes=0-100')
      .expect(200, '[{"start":0,"end":74}]')
    })

    it('should cap to the given size when open-ended', async () => {
      app.use((request: Request, response: Response) => {
        response.send(200, request.range(75))
      })

      await request(app.start())
      .get('/')
      .set('Range', 'bytes=0-')
      .expect(200, '[{"start":0,"end":74}]')
    })

    // it('should have a .type', async () => {
    //   app.use((request: Request, response: Response) => {
    //     response.send(200, request.range(120)[0]?.type!)
    //   })

    //   await request(app.start())
    //   .get('/')
    //   .set('Range', 'bytes=0-100')
    //   .expect(200, '"bytes"')
    // })

    it('should accept any type', async () => {
      app.use((request: Request, response: Response) => {
        response.send(200, (request.range(120) as any).type)
      })

      await request(app.start())
      .get('/')
      .set('Range', 'users=0-2')
      .expect(200, 'users')
    })

    it('should return undefined if no range', async () => {
      app.use((request: Request, response: Response) => {
        response.send(200, String(request.range(120)))
      })

      await request(app.start())
      .get('/')
      .expect(200, 'undefined')
    })
  })

  describe('.range(size, options)', () => {
    describe('with "combine: true" option', () => {
      it('should return combined ranges', async () => {
          app.use((request: Request, response: Response) => {
          response.send(200, request.range(120, {
            combine: true
          }))
        })

        await request(app.start())
        .get('/')
        .set('Range', 'bytes=0-50,51-100')
        .expect(200, '[{"start":0,"end":100}]')
      })
    })
  })
})
