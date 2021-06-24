import assert from 'assert'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'


describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.redirect(url)', () => {
    it('should default to a 302 redirect', (done) => {
      app.use((request: Request, response: Response) => {
        response.redirect('http://google.com')
      });

      request(app.start())
      .get('/')
      .expect('location', 'http://google.com')
      .expect(302, done);
    })

    it('should encode "url"', (done) => {
      app.use((request: Request, response: Response) => {
        response.redirect('https://google.com?q= 256 §10')
      })

      request(app.start())
      .get('/')
      .expect('Location', 'https://google.com?q= 256 Â§10')
      .expect(302, done)
    })

    it('should not touch already-encoded sequences in "url"', (done) => {
      app.use((request: Request, response: Response) => {
        response.redirect('https://google.com?q=%A710')
      })

      request(app.start())
      .get('/')
      .expect('Location', 'https://google.com?q=%A710')
      .expect(302, done)
    })

    it('should back respond correctly', (done) => {
      app.use((request: Request, response: Response) => {
        response.redirect('back')
      })

      request(app.start())
      .get('/')
      .expect('Location', '/')
      .expect(302, done)
    })
  })

  describe('.redirect(url) with status', () => {
    it('should set the response status', (done) => {
      app.use((request: Request, response: Response) => {
        response.status = 303
        response.redirect('http://google.com');
      });

      request(app.start())
      .get('/')
      .expect('Location', 'http://google.com')
      .expect(303, done)
    })
  })

  describe('when the request method is HEAD', () => {
    it('should ignore the body', (done) => {

      app.use((request: Request, response: Response) => {
        response.redirect('http://google.com');
      });

      request(app.start())
      .head('/')
      .expect(302)
      .expect('Location', 'http://google.com')
      .expect(shouldNotHaveBody())
      .end(done)
    })
  })

  describe('when accepting html', () => {
    it('should respond with html', (done) => {

      app.use((request: Request, response: Response) => {
        response.redirect('http://google.com');
      });

      request(app.start())
      .get('/')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect('Location', 'http://google.com')
      .expect(302, 'Redirecting to <a href="http%3A%2F%2Fgoogle.com">http%3A%2F%2Fgoogle.com</a>.', done)
    })

    it('should escape the url', (done) => {

      app.use((request: Request, response: Response) => {
        response.redirect('<la\'me>');
      });

      request(app.start())
      .get('/')
      .set('Host', 'http://example.com')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect('Location', '<la\'me>')
      .expect(302, `Redirecting to <a href="%3Cla'me%3E">%3Cla'me%3E</a>.`, done)
    })

    it('should include the redirect type', (done) => {

      app.use((request: Request, response: Response) => {
        response.status = 301
        response.redirect('http://google.com');
      });

      request(app.start())
      .get('/')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect('Location', 'http://google.com')
      .expect(301, 'Redirecting to <a href="http%3A%2F%2Fgoogle.com">http%3A%2F%2Fgoogle.com</a>.', done);
    })
  })

  describe('when accepting text', () => {
    it('should respond with text', (done) => {

      app.use((request: Request, response: Response) => {
        response.redirect('http://google.com');
      });

      request(app.start())
      .get('/')
      .set('Accept', 'text/plain')
      .expect('Content-Type', /text/)
      .expect('Location', 'http://google.com')
      .expect(302, 'Redirecting to http%3A%2F%2Fgoogle.com.', done)
    })

    it('should encode the url', (done) => {

      app.use((request: Request, response: Response) => {
        response.redirect('http://example.com/?param=<script>alert("hax");</script>');
      });

      request(app.start())
      .get('/')
      .set('Host', 'http://example.com')
      .set('Accept', 'text/plain, */*')
      .expect('Content-Type', /text/)
      .expect('Location', 'http://example.com/?param=<script>alert("hax");</script>')
      .expect(302, 'Redirecting to <a href="http%3A%2F%2Fexample.com%2F%3Fparam%3D%3Cscript%3Ealert(%22hax%22)%3B%3C%2Fscript%3E">http%3A%2F%2Fexample.com%2F%3Fparam%3D%3Cscript%3Ealert(%22hax%22)%3B%3C%2Fscript%3E</a>.', done)
    })

    it('should include the redirect type', (done) => {

      app.use((request: Request, response: Response) => {
        response.status = 301
        response.redirect('http://google.com');
      });

      request(app.start())
      .get('/')
      .set('Accept', 'text/plain, */*')
      .expect('Content-Type', /text/)
      .expect('Location', 'http://google.com')
      .expect(301, 'Redirecting to <a href="http%3A%2F%2Fgoogle.com">http%3A%2F%2Fgoogle.com</a>.', done);
    })
  })

  describe('when accepting neither text or html', () => {
    it('should respond with an empty body', (done) => {

      app.use((request: Request, response: Response) => {
        response.redirect('http://google.com');
      });

      request(app.start())
      .get('/')
      .set('Accept', 'application/octet-stream')
      .expect('location', 'http://google.com')
      .expect('content-length', '0')
      .expect(shouldNotHaveHeader('Content-Type'))
      .expect(shouldNotHaveBody)
      .expect(302)
      .end(done)
    })
  })
})

/**
 * Assert that a supertest response does not have a header.
 *
 * @param {string} header Header name to check
 * @returns {function}
 */
export function shouldNotHaveHeader(header) {
  return function (response) {
    assert.ok(!(header.toLowerCase() in response.headers), 'should not have header ' + header);
  };
}

function shouldNotHaveBody () {
  return function (response) {
    assert.ok(response.text === '' || response.text === undefined)
  }
}
