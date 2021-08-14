import assert from 'assert'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'


describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.redirect(url)', () => {
    it('should default to a 302 redirect', async () => {
      app.use((request: Request, response: Response) => {
        response.redirect('http://google.com')
      });

      await request(app.start())
      .get('/')
      .expect('location', 'http://google.com')
      .expect(302)
    })

    it('should encode "url"', async () => {
      app.use((request: Request, response: Response) => {
        response.redirect('https://google.com?q= 256 §10')
      })

      await request(app.start())
      .get('/')
      .expect('Location', 'https://google.com?q= 256 Â§10')
      .expect(302)
    })

    it('should not touch already-encoded sequences in "url"', async () => {
      app.use((request: Request, response: Response) => {
        response.redirect('https://google.com?q=%A710')
      })

      await request(app.start())
      .get('/')
      .expect('Location', 'https://google.com?q=%A710')
      .expect(302)
    })

    it('should back respond correctly', async () => {
      app.use((request: Request, response: Response) => {
        response.redirect('back')
      })

      await request(app.start())
      .get('/')
      .expect('Location', '/')
      .expect(302)
    })
  })

  describe('.redirect(url) with status', () => {
    it('should set the response status', async () => {
      app.use((request: Request, response: Response) => {
        response.status = 303
        response.redirect('http://google.com');
      });

      await request(app.start())
      .get('/')
      .expect('Location', 'http://google.com')
      .expect(303)
    })
  })

  describe('when the request method is HEAD', () => {
    it('should ignore the body', async () => {

      app.use((request: Request, response: Response) => {
        response.redirect('http://google.com');
      });

      await request(app.start())
      .head('/')
      .expect(302)
      .expect('Location', 'http://google.com')
      .expect(shouldNotHaveBody())
      
    })
  })

  describe('when accepting html', () => {
    it('should respond with html', async () => {

      app.use((request: Request, response: Response) => {
        response.redirect('http://google.com');
      });

      await request(app.start())
      .get('/')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect('Location', 'http://google.com')
      .expect(302, 'Redirecting to <a href="http%3A%2F%2Fgoogle.com">http%3A%2F%2Fgoogle.com</a>.')
    })

    it('should escape the url', async () => {

      app.use((request: Request, response: Response) => {
        response.redirect('<la\'me>');
      });

      await request(app.start())
      .get('/')
      .set('Host', 'http://example.com')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect('Location', '<la\'me>')
      .expect(302, `Redirecting to <a href="%3Cla'me%3E">%3Cla'me%3E</a>.`)
    })

    it('should include the redirect type', async () => {

      app.use((request: Request, response: Response) => {
        response.status = 301
        response.redirect('http://google.com');
      });

      await request(app.start())
      .get('/')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect('Location', 'http://google.com')
      .expect(301, 'Redirecting to <a href="http%3A%2F%2Fgoogle.com">http%3A%2F%2Fgoogle.com</a>.')
    })
  })

  describe('when accepting text', () => {
    it('should respond with text', async () => {

      app.use((request: Request, response: Response) => {
        response.redirect('http://google.com');
      });

      await request(app.start())
      .get('/')
      .set('Accept', 'text/plain')
      .expect('Content-Type', /text/)
      .expect('Location', 'http://google.com')
      .expect(302, 'Redirecting to http%3A%2F%2Fgoogle.com.')
    })

    it('should encode the url', async () => {

      app.use((request: Request, response: Response) => {
        response.redirect('http://example.com/?param=<script>alert("hax");</script>');
      });

      await request(app.start())
      .get('/')
      .set('Host', 'http://example.com')
      .set('Accept', 'text/plain, */*')
      .expect('Content-Type', /text/)
      .expect('Location', 'http://example.com/?param=<script>alert("hax");</script>')
      .expect(302, 'Redirecting to <a href="http%3A%2F%2Fexample.com%2F%3Fparam%3D%3Cscript%3Ealert(%22hax%22)%3B%3C%2Fscript%3E">http%3A%2F%2Fexample.com%2F%3Fparam%3D%3Cscript%3Ealert(%22hax%22)%3B%3C%2Fscript%3E</a>.')
    })

    it('should include the redirect type', async () => {

      app.use((request: Request, response: Response) => {
        response.status = 301
        response.redirect('http://google.com');
      });

      await request(app.start())
      .get('/')
      .set('Accept', 'text/plain, */*')
      .expect('Content-Type', /text/)
      .expect('Location', 'http://google.com')
      .expect(301, 'Redirecting to <a href="http%3A%2F%2Fgoogle.com">http%3A%2F%2Fgoogle.com</a>.')
    })
  })

  describe('when accepting neither text or html', () => {
    it('should respond with an empty body', async () => {

      app.use((request: Request, response: Response) => {
        response.redirect('http://google.com');
      });

      await request(app.start())
      .get('/')
      .set('Accept', 'application/octet-stream')
      .expect('location', 'http://google.com')
      .expect('content-length', '0')
      .expect(shouldNotHaveHeader('Content-Type'))
      .expect(shouldNotHaveBody)
      .expect(302)
      
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
