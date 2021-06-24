import fs from 'fs'
import assert from 'assert'
import request from 'supertest'
import HttpError from '@macchiatojs/http-error'
import Kernel, { Request, Response } from '../../src'

describe('kernel', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.onError', () => {
    it('handle catch should response and throws 500', (done) => {
      app.use(() => {
        throw new HttpError()
      })
    
      app.on('error', err => {
        assert(err !== null)        
      })

      request(app.start())
      .post('/')
      .expect(500, '500') // /HttpError: Internal Server Error/
      .end(done)
    })

    it('handle catch should response and throws 404', (done) => {
      app.use(() => {
        throw new HttpError(404, 'Not found')
      })
    
      app.on('error', err => {
        assert(err !== null)        
      })

      request(app.start())
      .post('/')
      .expect(404, '404') // /HttpError: Not found/
      .end(done)
    })

    it('should handle errors when no content status', (done) => {
      app.use((request:Request, response: Response) => {
        response.status = 204
        response.body = fs.createReadStream('does not exist')
      })
    
      app.on('error', err => {
        assert(err !== null)        
      })

      request(app.start())
      .post('/')
      .expect(204)
      .end(done)
    })

    it('should handle all intermediate stream body errors', (done) => {
      app.use((request:Request, response: Response) => {
        response.body = fs.createReadStream('does not exist')
        response.body = fs.createReadStream('does not exist')
        response.body = fs.createReadStream('does not exist')
      })
    
      app.on('error', err => {
        assert(err !== null)        
      })

      request(app.start())
      .post('/')
      .expect(404)
      .end(done)
    })
    
    it('should expose message', (done) => {
      app.dev = false

      app.use(() => {
        throw new HttpError(404, 'Nothing', undefined, true)
      })
    
      app.on('error', err => {
        assert(err !== null)        
      })

      request(app.start())
      .post('/')
      .expect(404, /Internal Server Error/) // change to /Nothing/ when we use custom http errors...
      .end(done)
    })

    // it('should ignore error after headerSent', (done) => {
    //   app.dev = false

    //   app.use(async (request: Request, response: Response) => {
    //     response.status = 200
    //     response.set('X-FOO', 'bar')
    //     response.flush()
    //     await Promise.reject(new Error('mock error'))
    //     response.body = 'response'
    //   })
    
    //   app.on('error', err => {
    //     assert(err !== null)        
    //     // assert(err.message === 'mock error')
    //     // assert(err.headersSent === true)
    //   })

    //   request(app.start())
    //   .post('/')
    //   .expect(200, '')
    //   .end(done)
    // })
  })
})
