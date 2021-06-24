import assert from 'assert'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.lastModified', () => {
    it('should set the header as a UTCString', (done) => {
      app.use((request: Request, response: Response) => {
        const date = new Date()
        response.lastModified = date
        response.send(200, response.headers['last-modified'] === date.toUTCString())
      });

      request(app.start())
      .get('/')
      .expect(200, 'true', done);
    })

    it('should work with date strings', (done) => {
      app.use((request: Request, response: Response) => {
        const date = new Date()
        response.lastModified = date.toString()
        response.send(200, response.headers['last-modified'] === date.toUTCString())
      });

      request(app.start())
      .get('/')
      .expect(200, 'true', done);
    })

    it('should get the header as a Date', (done) => {
      // Note: Date() removes milliseconds, but it's practically important.
      app.use((request: Request, response: Response) => {
        const date = new Date()
        response.lastModified = date
        response.send(200, (response.lastModified.getTime() / 1000 === Math.floor(date.getTime() / 1000)))
      });

      request(app.start())
      .get('/')
      .expect(200, 'true', done);
    })

    it('when lastModified not set should get undefined', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, response.lastModified)
      });

      request(app.start())
      .get('/')
      .expect(200, '', done);
    })
  })
})
