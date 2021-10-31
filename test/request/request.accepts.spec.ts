import request from 'supertest'

import Kernel, { Request, Response } from '../../src'

describe('request', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('.accepts(type)', () => {
    it('should return true when Accept is not present', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.accepts('json') ? 'yes' : 'no')
      })

      await request(app.start())
        .get('/')
        .expect('yes')
    })

    it('should return true when present', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.accepts('json') ? 'yes' : 'no')
      })

      await request(app.start())
        .get('/')
        .set('Accept', 'application/json')
        .expect('yes')
    })

    it('should return false otherwise', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.accepts('json') ? 'yes' : 'no')
      })

      await request(app.start())
        .get('/')
        .set('Accept', 'text/html')
        .expect('no')
    })
  })

  it('should accept an argument list of type names', async () => { 
    app.use((request: Request, response: Response) => {
      response.end(request.accepts('json', 'html'))
    })

    await request(app.start())
      .get('/')
      .set('Accept', 'application/json')
      .expect('json')
  })

  describe('.accepts(types)', () => {
    it('should return the first when Accept is not present', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.accepts(['json', 'html']))
      })

      await request(app.start())
        .get('/')
        .expect('json')
    })

    it('should return the first acceptable type', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.accepts(['json', 'html']))
      })

      await request(app.start())
        .get('/')
        .set('Accept', 'text/html')
        .expect('html')
    })

    it('should return false when no match is made', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.accepts(['text/html', 'application/json']) ? 'yup' : 'nope')
      })

      await request(app.start())
        .get('/')
        .set('Accept', 'foo/bar, bar/baz')
        .expect('nope')
    })

    it('should take quality into account', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.accepts(['text/html', 'application/json']))
      })

      await request(app.start())
        .get('/')
        .set('Accept', '*/html q=.5, application/json')
        .expect('application/json')
    })

    it('should return the first acceptable type with canonical mime types', async () => { 
      app.use((request: Request, response: Response) => {
        response.end(request.accepts(['application/json', 'text/html']))
      })

      await request(app.start())
        .get('/')
        .set('Accept', '*/html')
        .expect('text/html')
    })
  })
})
