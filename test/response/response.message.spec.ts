import assert from 'assert'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.message', () => {
    it('should return the response status message', (done) => {
      app.use((request: Request, response: Response) => {
        response.send(200, response.message)
        assert(response.message === 'OK')
      });

      request(app.start())
        .get('/')
        .expect(200, '', done)
    })

    it('should set response status message', (done) => {
      app.use((request: Request, response: Response) => {
        assert(response.message === undefined)         
        response.message = 'OK'
        response.end()
        assert(response.message === 'OK')
      });

      request(app.start())
        .get('/')
        .expect(200, '', done)
    })
  })
})