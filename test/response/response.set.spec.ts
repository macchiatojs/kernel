import request from 'supertest'
import Kernel, { Request, Response } from '../../src'


describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.set(field, value)', () => {
    it('should set a field value', (done) => {
      app.use((request: Request, response: Response) => {
        response.set('x-foo', 'bar')
        response.send(200, response.get('x-foo'));
      });

      request(app.start())
      .get('/')
      .expect(200, 'bar', done);
    })

    it('should set a field value of array', (done) => {
      app.use((request: Request, response: Response) => {
        response.set('x-foo', ['foo', 'bar'])
        response.send(200, response.get('x-foo'));
      });

      request(app.start())
      .get('/')
      .expect(200, '["foo","bar"]', done);
    })

    it('should set multiple fields', (done) => {
      app.use((request: Request, response: Response) => {
        response.set({ foo: '1', bar: '2' })
        response.send(200, [response.get('foo'), response.get('bar')]);
      });

      request(app.start())
      .get('/')
      .expect(200, '["1","2"]', done);
    })
  })
})
