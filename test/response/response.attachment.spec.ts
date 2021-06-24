import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.attachment()', () => {
    it('should Content-Disposition to attachment', (done) => {
      app.use((request: Request, response: Response) => {
        response.attachment()
        response.send(200, 'foo')
      });

      request(app.start())
      .get('/')
      .expect('Content-Disposition', 'attachment', done);
    })
  })

  describe('.attachment(filename)', () => {
    it('should add the filename param', (done) => {
      app.use((request: Request, response: Response) => {
        response.attachment('/path/to/image.png');
        response.send(200, 'foo');
      });

      request(app.start())
      .get('/')
      .expect('Content-Disposition', 'attachment; filename="image.png"', done);
    })

    it('should set the Content-Type', (done) => {
      app.use((request: Request, response: Response) => {
        response.attachment('/path/to/image.png');
        response.send(200, Buffer.alloc(4, '.'))
      });

      request(app.start())
      .get('/')
      .expect('Content-Type', 'image/png', done);
    })
  })

  describe('.attachment(utf8filename)', () => {
    it('should add the filename and filename* params', (done) => {
      app.use((request: Request, response: Response) => {
        response.attachment('/locales/日本語.txt');
        response.send(200, 'japanese');
      });

      request(app.start())
      .get('/')
      .expect('Content-Disposition', 'attachment; filename="???.txt"; filename*=UTF-8\'\'%E6%97%A5%E6%9C%AC%E8%AA%9E.txt')
      .expect(200, done);
    })

    it('should set the Content-Type', (done) => {
      app.use((request: Request, response: Response) => {
        response.attachment('/locales/日本語.txt');
        response.send(200, 'japanese');
      });

      request(app.start())
      .get('/')
      .expect('Content-Type', 'text/plain; charset=utf-8', done);
    })
  })
})
