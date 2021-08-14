import request from 'supertest'
import Kernel, { Request, Response } from '../../src'


describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.has(field)', () => {
    it('should has a field', async () => {
      app.use((request: Request, response: Response) => {
        response.set('Content-Type', 'text/x-foo');
        response.send(200, response.has('Content-Type'));
      });

      await request(app.start())
      .get('/')
      .expect(200, 'true')
    })

    it('should has not field', async () => {
      app.use((request: Request, response: Response) => {
        response.send(200, response.has('Content-Type'));
      });

      await request(app.start())
      .get('/')
      .expect(200, 'false')
    })
  })
})