import fs from 'fs'
import assert from 'assert'
import request from 'supertest'
import HttpError from '@macchiatojs/http-error'

import Kernel from '../../src'
import type { Request, Response } from '../../src'

describe('kernel', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.onError', () => {
    it('handle catch should response and throws 500', async () => { 
      app.use(() => {
        throw new HttpError()
      })
    
      app.on('error', err => {
        assert(err !== null)        
      })

      await request(app.start())
      .post('/')
      .expect(500, '500') // /HttpError: Internal Server Error/
      
    })

    it('handle catch should response and throws 404', async () => { 
      app.use(() => {
        throw new HttpError(404, 'Not found')
      })
    
      app.on('error', err => {
        assert(err !== null)        
      })

      await request(app.start())
      .post('/')
      .expect(404, '404') // /HttpError: Not found/
      
    })

    it('should handle errors when no content status', async () => { 
      app.use((request: Request, response: Response) => {
        response.status = 204
        response.body = fs.createReadStream('does not exist')
      })
    
      app.on('error', err => {
        assert(err !== null)        
      })

      await request(app.start())
      .post('/')
      .expect(204)
      
    })

    it('should handle all intermediate stream body errors', async () => { 
      app.use((request: Request, response: Response) => {
        response.body = fs.createReadStream('does not exist')
        response.body = fs.createReadStream('does not exist')
        response.body = fs.createReadStream('does not exist')
      })
    
      app.on('error', err => {
        assert(err !== null)        
      })

      await request(app.start())
      .post('/')
      .expect(404)
    })

    it('should handle socket errors', async () => { 
      const app = new Kernel()
  
      app.use((request: Request, response: Response) => {
        // triggers request.socket.writable == false
        response.socket.emit('error', new Error('boom'))
      })
      
      let makeSureIsThrowError = 10
      app.on('error', err => {
        assert(err !== null)
        makeSureIsThrowError += 100
        assert(err.message === 'boom')
      })
  
      await request(app.start()).get('/')      
      assert(makeSureIsThrowError === 110)
    })
    
    it('should expose message', async () => { 
      app.dev = false

      app.use(() => {
        throw new HttpError(404, 'Nothing', undefined, true)
      })
    
      app.on('error', err => {
        assert(err !== null)        
      })

      await request(app.start())
      .post('/')
      .expect(404, /Nothing/)
      
    })

    it('should ignore error after headerSent', (done) => {
      // app.dev = false 

      app.use(async (request: Request, response: Response) => {
        response.status = 200
        response.set('X-FOO', 'bar')
        response.flush()
        await Promise.reject(new Error('mock error'))
        response.body = 'response'
      })
    
      app.on('error', err => {
        assert(err !== null)        
        assert(err.message === 'mock error')
        assert(err.headersSent === true)
        done()
      })

      request(app.start())
      .get('/')
      .expect('X-Foo', 'Bar')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .expect(200, () => {}) 
    })
  })
})
