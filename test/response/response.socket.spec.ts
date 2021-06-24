import { Socket } from 'net'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.socket()', () => {
    it('should return the request socket object', (done) => {
      app.use((request: Request, response: Response) => {
        console.dir(response.socket)
        response.send(200, (request.socket instanceof Socket));
      });

      request(app.start())
      .get('/')
      .expect(200, 'true', done);
    })
  })
})


