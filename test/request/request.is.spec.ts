import request from 'supertest'

import Kernel, { Request, Response } from '../../src'

describe('request.is()', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  describe('when given a mime type', () => {
    it('should return the type when matching', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('application/json'))
      })

      await request(app.start())
        .post('/')
        .type('application/json')
        .send('{}')
        .expect(200, 'application/json')
    })

    it('should return false when not matching', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('image/jpeg'))
      })

      await request(app.start())
        .post('/')
        .type('application/json')
        .send('{}')
        .expect(200, 'false')
    })

    it('should ignore charset', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('application/json'))
      })

      await request(app.start())
        .post('/')
        .type('application/json; charset=UTF-8')
        .send('{}')
        .expect(200, 'application/json')
    })
  })

  describe('when content-type is not present', () => {
    it('should return false', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('application/json'))
      })

      await request(app.start())
        .post('/')
        .send('{}')
        .expect(200, 'false')
    })
  })

  describe('when given an extension', () => {
    it('should lookup the mime type', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('json'))
      })

      await request(app.start())
        .post('/')
        .type('application/json')
        .send('{}')
        .expect(200, 'json')
    })
  })

  describe('when given */subtype', () => {
    it('should return the full type when matching', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('*/json'))
      })

      await request(app.start())
        .post('/')
        .type('application/json')
        .send('{}')
        .expect(200, 'application/json')
    })

    it('should return false when not matching', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('*/html'))
      })

      await request(app.start())
        .post('/')
        .type('application/json')
        .send('{}')
        .expect(200, 'false')
    })

    it('should ignore charset', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('*/json'))
      })

      await request(app.start())
        .post('/')
        .type('application/json; charset=UTF-8')
        .send('{}')
        .expect(200, 'application/json')
    })
  })

  describe('when given type/*', () => {
    it('should return the full type when matching', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('application/*'))
      })

      await request(app.start())
        .post('/')
        .type('application/json')
        .send('{}')
        .expect(200, 'application/json')
    })

    it('should return false when not matching', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('text/*'))
      })

      await request(app.start())
        .post('/')
        .type('application/json')
        .send('{}')
        .expect(200, 'false')
    })

    it('should ignore charset', async () => { 
      app.use((request: Request, response: Response) => {
        response.send(200, request.is('application/*'))
      })

      await request(app.start())
        .post('/')
        .type('application/json; charset=UTF-8')
        .send('{}')
        .expect(200, 'application/json')
    })
  })
})