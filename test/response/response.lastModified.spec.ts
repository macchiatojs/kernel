import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.lastModified', () => {
    it('should set the header as a UTCString', async () => { 
      app.use((request: Request, response: Response) => {
        const date = new Date()
        response.lastModified = date
        response.send(200, response.headers['last-modified'] === date.toUTCString())
      })

      await request(app.start())
        .get('/')
        .expect(200, 'true')
    })

    it('should work with date strings', async () => { 
      app.use((request: Request, response: Response) => {
        const date = new Date()
        response.lastModified = date.toString()
        response.send(200, response.headers['last-modified'] === date.toUTCString())
      })

      await request(app.start())
        .get('/')
        .expect(200, 'true')
    })

    it('should get the header as a Date', async () => { 
      // Note: Date() removes milliseconds, but it's practically important.
      app.use((request: Request, response: Response) => {
        const date = new Date()
        response.lastModified = date
        response.send(200, (response.lastModified.getTime() / 1000 === Math.floor(date.getTime() / 1000)))
      })

      await request(app.start())
        .get('/')
        .expect(200, 'true')
    })

    it('when lastModified not set should get undefined', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, response.lastModified)
      })

      await request(app.start())
        .get('/')
        .expect(200, '')
    })
  })
})
